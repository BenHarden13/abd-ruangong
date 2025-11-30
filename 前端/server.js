const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3000;

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 处理请求URL
    let url = req.url;
    if (url === '/') {
        url = '/pages/index.html';
    }
    const filePath = path.join(__dirname, url.slice(1));
    
    // 读取文件
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            // 设置正确的Content-Type
            let contentType = 'application/octet-stream';
            if (filePath.endsWith('.html')) contentType = 'text/html';
            else if (filePath.endsWith('.css')) contentType = 'text/css';
            else if (filePath.endsWith('.js')) contentType = 'application/javascript';
            else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
            else if (filePath.endsWith('.png')) contentType = 'image/png';
            else if (filePath.endsWith('.gif')) contentType = 'image/gif';
            else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

// 启动服务器
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
