package com.cc91.util;

import org.springframework.web.util.HtmlUtils;

/**
 * HTML 净化工具类，防止存储型 XSS 攻击
 */
public class HtmlSanitizer {

    private HtmlSanitizer() {
        // 工具类不允许实例化
    }

    /**
     * 转义 HTML 特殊字符，防止存储型 XSS
     */
    public static String escape(String input) {
        if (input == null) return null;
        return HtmlUtils.htmlEscape(input, "UTF-8");
    }

    /**
     * 对内容进行基本净化 -- 允许部分安全的 HTML 标签（如帖子内容中的格式化标签）
     * 但移除 script、iframe、onXXX 等危险内容
     */
    public static String sanitizeContent(String content) {
        if (content == null) return null;
        // 移除 script 标签
        String sanitized = content.replaceAll("(?i)<script[^>]*>.*?</script>", "");
        // 移除 onXXX 事件属性
        sanitized = sanitized.replaceAll("(?i)\\s+on\\w+\\s*=\\s*[\"'][^\"']*[\"']", "");
        // 移除 iframe、object、embed 标签
        sanitized = sanitized.replaceAll("(?i)</?(iframe|object|embed|form|input)[^>]*>", "");
        // 移除 javascript: 协议
        sanitized = sanitized.replaceAll("(?i)javascript:", "");
        return sanitized;
    }
}
