const fs = require("fs");
const path = require("path");
const pkg = require("./package.json");

const fileList = [
  {
    name: "package.json",
    content: JSON.stringify({
      ...pkg,
      publishConfig: {
        registry: "http://10.168.4.75:8081/repository/mti-gis-npm-hosted/",
      },
      files: ["index.cjs", "Source", "Build"],
    }),
  },
  {
    name: ".npmrc",
    content: `email=fancq@mti-sh.cn
always-auth=true
registry = http://10.168.4.75:8081/repository/mti-gis-npm-hosted/
# registry = http://10.168.4.75:8081/repository/mti-npm/
_auth=ZmFuY3E6MTEyMjMz=
# username  fancq
# password  112233
`,
  },
];

const publishPath = path.join(__dirname, "./publish");

function removeDir(dir) {
  let files = fs.readdirSync(dir);
  for (var i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i]);
    let stat = fs.statSync(newPath);
    if (stat.isDirectory()) {
      removeDir(newPath);
    } else {
      fs.unlinkSync(newPath);
    }
  }
  fs.rmdirSync(dir);
}

if (fs.existsSync(publishPath)) {
  removeDir(publishPath);
}

fs.mkdirSync(publishPath);

for (const item of fileList) {
  fs.writeFileSync(path.join(publishPath, `./${item.name}`), item.content);
}

function copyDir(src, dist, callback) {
  fs.access(dist, function (err) {
    if (err) {
      fs.mkdirSync(dist);
    }
    _copy(null, src, dist);
  });

  function _copy(err, src, dist) {
    if (err) {
      callback(err);
    } else {
      fs.readdir(src, function (err, paths) {
        if (err) {
          callback(err);
        } else {
          paths.forEach(function (path) {
            var _src = src + "/" + path;
            var _dist = dist + "/" + path;
            fs.stat(_src, function (err, stat) {
              if (err) {
                callback(err);
              } else {
                if (stat.isFile()) {
                  fs.writeFileSync(_dist, fs.readFileSync(_src));
                } else if (stat.isDirectory()) {
                  copyDir(_src, _dist, callback);
                }
              }
            });
          });
        }
      });
    }
  }
}

fs.mkdirSync(path.join(publishPath, "./Build"));
fs.mkdirSync(path.join(publishPath, "./Build/Cesium"));
fs.mkdirSync(path.join(publishPath, "./Build/CesiumUnminified"));

copyDir(
  path.join(__dirname, `./Build/Cesium`),
  path.join(publishPath, "./Build/Cesium"),
  function (err) {
    if (err) {
      console.log(err);
    }
  }
);
copyDir(
  path.join(__dirname, `./Build/CesiumUnminified`),
  path.join(publishPath, "./Build/CesiumUnminified"),
  function (err) {
    if (err) {
      console.log(err);
    }
  }
);

fs.writeFileSync(
  path.join(publishPath, "./Build/package.json"),
  fs.readFileSync(path.join(__dirname, `./Build/package.json`))
);
fs.writeFileSync(
  path.join(publishPath, "./index.cjs"),
  fs.readFileSync(path.join(__dirname, `./index.cjs`))
);

copyDir(
  path.join(__dirname, `./Source`),
  path.join(publishPath, "./Source"),
  function (err) {
    if (err) {
      console.log(err);
    }
  }
);
