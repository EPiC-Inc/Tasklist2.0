var http = require('http');
var fs = require('fs');
var url = require('url');

var port = process.env.PORT || 5000;

console.log("Starting server on port "+port);

http.createServer(function (req, res) {
  var q = url.parse(req.url, true);

  if (q.pathname == '' || q.pathname == '/') {
    var filename = "./html/index.html";
  } else if (q.pathname.endsWith(".html") || q.pathname.endsWith(".htm") || q.pathname.endsWith(".shtml") || q.pathname.endsWith(".css") || q.pathname.endsWith(".xhtml") || q.pathname.endsWith(".js")){
    var filename = "./html/"+q.pathname;
  } else {
    var filename = "./html/" + q.pathname+"/index.html";
  }

  fs.readFile(filename, function(err, data) {
    if (err && err.code == "ENOENT") {
      fs.readFile("./html/404.html", function(err, data) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write("<h1 style=\"text-align:center\">Error 404! The path "+filename+" was not found on the server!</h1><br>");
        return res.end(data);
      });
    } else if (String(data) === "undefined"){
      res.writeHead(401, {'Content-Type': 'text/html'});
      res.write("<h1 style=\"text-align:center\">Error 401 Unauthorized</h1>");
      return res.end();
    } else if (q.pathname.endsWith(".css")){
      res.writeHead(200, {'Content-Type': 'text/css'});
      return res.end(data);
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(String(data));
      return res.end();
    }
  });
}).listen(port);