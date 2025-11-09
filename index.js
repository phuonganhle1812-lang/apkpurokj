// 域名池配置
const domainConfig = {
    // 固定的顶级域名列表
    topLevelDomains: [
        'example.com',
        'demo.org',
        'mysite.net',
        'product.io'
    ],
    // 用于生成二级域名的随机前缀列表
    subDomainPrefixes: [
        'www', 'blog', 'app', 'web', 'dev', 'api', 'beta', 'alpha',
        'test', 'store', 'shop', 'cdn', 'image', 'data', 'static',
        'report', 'admin', 'panel', 'user', 'member', 'service'
    ],
    // 二级域名部分的长度范围（例如，可以生成类似 'sub-123.example.com'）
    subDomainRandomLength: {
        min: 3, // 随机部分的最小长度
        max: 6  // 随机部分的最大长度
    },
    // 是否在随机生成二级域名时，将 'www' 作为一个特殊的可能项
    includeWwwAsSpecial: true
};

/**
 * 生成一个随机字符串作为二级域名的一部分。
 * @param {number} length 字符串的长度。
 * @returns {string} 随机生成的字符串。
 */
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * 随机生成一个完整的二级域名（不包含顶级域名部分）。
 * 可以包含预定义的前缀和随机字符串。
 * @returns {string} 随机生成的二级域名部分 (e.g., "blog-xyz", "www", "app123").
 */
function generateRandomSubdomain() {
    const prefixes = domainConfig.subDomainPrefixes;
    const { min, max } = domainConfig.subDomainRandomLength;

    let subDomainParts = [];

    // 随机选择一个预定义的前缀
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    subDomainParts.push(randomPrefix);

    // 随机决定是否添加一个随机字符串部分
    if (Math.random() > 0.3) { // 约70%的概率添加随机字符串
        const randomLength = Math.floor(Math.random() * (max - min + 1)) + min;
        subDomainParts.push(generateRandomString(randomLength));
    }

    // 随机决定是否在某个位置插入 'www'
    if (domainConfig.includeWwwAsSpecial && Math.random() < 0.2) { // 20%的概率插入'www'
        const wwwIndex = Math.floor(Math.random() * (subDomainParts.length + 1));
        subDomainParts.splice(wwwIndex, 0, 'www');
    }

    // 将各部分用 '.' 或 '-' 连接，这里用 '.' 更符合域名规范，但实际可能需要 '-'
    // 为了域名的合法性，二级域名之间通常用 '.' 连接，但如果是一个整体的二级域名，也可以是 '-'
    // 例如：'blog.randomstring.example.com' 或 'blog-randomstring.example.com'
    // 这里我们假设生成的整体是一个“子域名部分”，它最终会和顶级域名用 '.' 连接
    // 所以，我们让内部连接使用 '-'，这样更像一个有意义的整体
    return subDomainParts.join('-');
}


/**
 * 随机选择一个固定的顶级域名。
 * @returns {string} 随机选择的顶级域名。
 */
function getRandomTopLevelDomain() {
    const topDomains = domainConfig.topLevelDomains;
    return topDomains[Math.floor(Math.random() * topDomains.length)];
}

/**
 * 构建完整的重定向URL。
 * @returns {string} 完整的重定向URL。
 */
function buildRedirectURL() {
    const subdomainPart = generateRandomSubdomain();
    const topDomain = getRandomTopLevelDomain();
    const protocol = Math.random() > 0.5 ? 'https' : 'http'; // 随机选择 http 或 https

    // 组装最终的URL：协议://二级域名部分.顶级域名
    return `${protocol}://${subdomainPart}.${topDomain}`;
}

/**
 * 执行实际的浏览器重定向。
 */
function performRedirect() {
    const targetURL = buildRedirectURL();

    console.log(`正在重定向到: ${targetURL}`); // 便于调试

    try {
        // 使用 window.location.replace() 更佳，因为它不会留下历史记录，防止用户点击返回键返回到重定向页面。
        window.location.replace(targetURL);
        // 如果想保留历史记录，可以使用 window.location.href = targetURL;
    } catch (error) {
        console.error('重定向失败:', error);
        // 可以添加备用方案，例如显示错误消息或跳转到默认页面
        // window.location.href = 'https://default.example.com/error';
    }
}

/**
 * 安全启动重定向，防止无限循环或快速重定向。
 * 使用 localStorage 来限制重定向次数。
 */
function secureRedirect() {
    const storageKey = 'randomRedirectCount';
    let redirectCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
    const maxRedirects = 3; // 在短时间内最多重定向3次

    // 如果是第一次访问或者重定向次数未达到上限
    if (redirectCount < maxRedirects) {
        localStorage.setItem(storageKey, (redirectCount + 1).toString());
        // 清除计数器，例如10秒后清除，防止用户重新加载页面时计数器一直增加
        setTimeout(() => localStorage.removeItem(storageKey), 10 * 1000); // 10秒后重置
        performRedirect();
    } else {
        console.warn(`已达到最大重定向次数 (${maxRedirects})，不再进行重定向。`);
        // 可以选择在这里跳转到一个默认的、非随机的页面
        // window.location.replace('https://fallback.example.com');
    }
}

// ------------------- 调用重定向 -------------------
// 页面加载完成后立即执行重定向
document.addEventListener('DOMContentLoaded', secureRedirect);

// ------------------- 调试和测试 -------------------
// 您可以在控制台中手动调用 buildRedirectURL() 来查看生成的URL
// console.log(buildRedirectURL());
// console.log(buildRedirectURL());
