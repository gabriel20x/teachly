import re
import bleach
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse
import html

# Configure bleach for safe HTML sanitization
ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'u']
ALLOWED_ATTRIBUTES = {}

def sanitize_message(message: str) -> str:
    """
    Sanitize message content to prevent XSS attacks.
    
    Args:
        message: Raw message content
        
    Returns:
        Sanitized message content
    """
    # Remove any HTML tags except allowed ones
    sanitized = bleach.clean(message, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES)
    
    # Also escape any remaining HTML entities
    sanitized = html.escape(sanitized, quote=False)
    
    return sanitized.strip()

def validate_message_length(message: str, max_length: int = 1000) -> bool:
    """
    Validate message length.
    
    Args:
        message: Message content
        max_length: Maximum allowed length
        
    Returns:
        True if message length is valid
    """
    return len(message) <= max_length

def detect_potential_spam(message: str) -> bool:
    """
    Detect potential spam patterns in messages.
    
    Args:
        message: Message content
        
    Returns:
        True if potential spam is detected
    """
    # Check for excessive repetition
    if len(set(message.lower())) < len(message) * 0.3 and len(message) > 20:
        return True
    
    # Check for excessive capitalization
    if len(re.findall(r'[A-Z]', message)) > len(message) * 0.5 and len(message) > 10:
        return True
    
    # Check for excessive special characters
    special_chars = re.findall(r'[!@#$%^&*()_+\-=\[\]{};\'\\:"|,.<>?]', message)
    if len(special_chars) > len(message) * 0.3 and len(message) > 10:
        return True
    
    return False

def extract_urls(message: str) -> List[str]:
    """
    Extract URLs from message content.
    
    Args:
        message: Message content
        
    Returns:
        List of URLs found in the message
    """
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    urls = re.findall(url_pattern, message)
    return urls

def validate_url_safety(url: str) -> Tuple[bool, str]:
    """
    Validate URL safety to prevent malicious redirects.
    
    Args:
        url: URL to validate
        
    Returns:
        Tuple of (is_safe, reason)
    """
    try:
        parsed = urlparse(url)
        
        # Check for dangerous schemes
        if parsed.scheme not in ['http', 'https']:
            return False, "Invalid URL scheme"
        
        # Check for localhost/internal network access
        hostname = parsed.hostname
        if hostname:
            # Block localhost and internal IPs
            if hostname.lower() in ['localhost', '127.0.0.1', '0.0.0.0']:
                return False, "Localhost URLs not allowed"
            
            # Block private IP ranges
            if (hostname.startswith('192.168.') or 
                hostname.startswith('10.') or 
                hostname.startswith('172.')):
                return False, "Private IP addresses not allowed"
        
        # Check for suspicious patterns
        if '..' in url or url.count('/') > 10:
            return False, "Suspicious URL pattern"
        
        return True, "URL is safe"
        
    except Exception as e:
        return False, f"URL validation error: {str(e)}"

def validate_message_content(message: str) -> Dict[str, any]:
    """
    Comprehensive message validation and sanitization.
    
    Args:
        message: Raw message content
        
    Returns:
        Dict containing validation results and sanitized message
    """
    result = {
        'is_valid': True,
        'sanitized_message': '',
        'errors': [],
        'warnings': [],
        'detected_urls': [],
        'blocked_urls': []
    }
    
    # Check if message is empty
    if not message.strip():
        result['is_valid'] = False
        result['errors'].append("Message cannot be empty")
        return result
    
    # Validate message length
    if not validate_message_length(message):
        result['is_valid'] = False
        result['errors'].append("Message too long (max 1000 characters)")
        return result
    
    # Sanitize the message
    sanitized = sanitize_message(message)
    result['sanitized_message'] = sanitized
    
    # Detect potential spam
    if detect_potential_spam(sanitized):
        result['warnings'].append("Message may contain spam patterns")
    
    # Extract and validate URLs
    urls = extract_urls(sanitized)
    result['detected_urls'] = urls
    
    for url in urls:
        is_safe, reason = validate_url_safety(url)
        if not is_safe:
            result['blocked_urls'].append({'url': url, 'reason': reason})
            result['warnings'].append(f"Potentially unsafe URL detected: {url}")
    
    # Log if message was modified during sanitization
    if sanitized != message:
        result['warnings'].append("Message was sanitized for security")
    
    return result

def validate_user_input(input_data: Dict[str, any]) -> Dict[str, any]:
    """
    Validate user input from WebSocket messages.
    
    Args:
        input_data: Dictionary containing user input
        
    Returns:
        Dict containing validation results
    """
    result = {
        'is_valid': True,
        'errors': [],
        'sanitized_data': {}
    }
    
    # Validate required fields
    required_fields = ['event', 'to', 'message']
    for field in required_fields:
        if field not in input_data:
            result['is_valid'] = False
            result['errors'].append(f"Missing required field: {field}")
    
    if not result['is_valid']:
        return result
    
    # Validate event type
    allowed_events = ['message', 'typing', 'message_seen', 'mark_messages_seen', 'get_connected_users']
    if input_data['event'] not in allowed_events:
        result['is_valid'] = False
        result['errors'].append(f"Invalid event type: {input_data['event']}")
        return result
    
    # Validate message content if present
    if 'message' in input_data:
        message_validation = validate_message_content(input_data['message'])
        if not message_validation['is_valid']:
            result['is_valid'] = False
            result['errors'].extend(message_validation['errors'])
        else:
            result['sanitized_data']['message'] = message_validation['sanitized_message']
    
    # Validate user IDs
    if 'to' in input_data:
        try:
            user_id = int(input_data['to'])
            if user_id <= 0:
                result['is_valid'] = False
                result['errors'].append("Invalid user ID")
            else:
                result['sanitized_data']['to'] = user_id
        except (ValueError, TypeError):
            result['is_valid'] = False
            result['errors'].append("User ID must be a valid integer")
    
    # Copy other safe fields
    for field in ['event', 'is_typing', 'message_id', 'from_user_id']:
        if field in input_data:
            result['sanitized_data'][field] = input_data[field]
    
    return result

def rate_limit_key(user_id: str, action: str) -> str:
    """
    Generate a unique key for rate limiting.
    
    Args:
        user_id: User identifier
        action: Action being performed
        
    Returns:
        Unique rate limit key
    """
    return f"rate_limit:{user_id}:{action}"

def is_safe_redirect_url(url: str, allowed_domains: List[str]) -> bool:
    """
    Check if a redirect URL is safe.
    
    Args:
        url: URL to check
        allowed_domains: List of allowed domains
        
    Returns:
        True if URL is safe for redirect
    """
    try:
        parsed = urlparse(url)
        
        # Must be https for external redirects
        if parsed.scheme != 'https':
            return False
        
        # Check if domain is in allowed list
        hostname = parsed.hostname
        if hostname and hostname.lower() in [domain.lower() for domain in allowed_domains]:
            return True
        
        return False
        
    except Exception:
        return False 