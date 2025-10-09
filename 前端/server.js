const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8080;

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 处理请求URL
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.slice(1));
    
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
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

// 启动服务器
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});