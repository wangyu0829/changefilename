var fs = require('fs');
var root_path = process.env.PWD; // 当前文件夹目录
var w_file = 'file.js';

/**
 * 字符串扩展方法，格式化，类似于c# string.format
 */
String.prototype.format = function (args) {
  var result = this;
  if (arguments.length > 0) {
    if (arguments.length == 1 && typeof (args) == "object") {
      for (var key in args) {
        if (args[key] != undefined) {
          var reg = new RegExp("({" + key + "})", "g");
          result = result.replace(reg, args[key]);
        }
      }
    } else {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != undefined) {
          var reg = new RegExp("({)" + i + "(})", "g");
          result = result.replace(reg, arguments[i]);
        }
      }
    }
  }
  return result;
}

/**
 * 字符串扩展方法，判断是否以某字符开始
 */
String.prototype.startWith = function (str) {
  var reg = new RegExp("^" + str);
  return reg.test(this);
}

/**
 * 字符串扩展方法，判断是否以某字符结束
 */
String.prototype.endWith = function (str) {
  var reg = new RegExp(str + "$");
  return reg.test(this);
}

function getAllFiles(root) {
  var res = '', files = fs.readdirSync(root);
  res = res.concat('var FACES = [];').concat('\n');

  // 企业圈表情配置文件格式
  var stringTmpl =
    // 0: id 1: id  2: zh_CN  3: zh_TW 4: word 
    "FACES[{0}] = FACES['/fs:{0}/'] = FACES['[{1}]'] = FACES['[{2}]'] = {" + "\n" +
    "id: '{0}'," + "\n" +
    "zh_CN: '[{1}]'," + "\n" +
    "zh_TW: '[{2}]'," + "\n" +
    "word: ''," + "\n" +
    "img: './img/faces/face{0}.png'," + "\n" +
    "pageImg: './img/faces/face{0}.png'" + "\n" +
    "};" + "\n";

  var sortArr = [];
  var fileNames = [];

  // 先对文件名按照id 进行排序
  files.forEach(function (file) {
    if (file != '.DS_Store' && file != 'readFile.js' && file != 'file.js' && file != 'file2.js') {
      file = file.replace('.png', '');
      var names = file.split('-');
      var index = names[0];
      var id = names[1];
      var zh_CN = names[2];
      var zh_TW = names[3];
      var word= names[4];
      fileNames[id]=file;
    }
  });

  // 遍历文件名
  fileNames.forEach(function (file) {
    if (file != '.DS_Store' && file != 'readFile.js' && file != 'file.js' && file != 'file2.js') {
      var names = file.split('-');
      var id = names[1];
      var index = names[0];
      var zh_CN = names[2];
      var zh_TW = names[3];
      var word = names[4];
      // 拼接H5格式字符串
      var str = stringTmpl.format(id, names[2], names[3]);
      res = res.concat(str);

      // 重命名表情图片文件名
      fs.rename(file + '.png', 'face' + id + '.png', function (err) { });

      // 0 index 1 id
      sortArr[index] = id;
    }
  });



  // 拼接面板序号数组

  // 每页21个表情位置，一页显示20个表情，剩余非表情位置用-1占位
  var arrIndex = 0;
  var arrLength = sortArr.length;
  while (arrIndex < arrLength) {
    arrIndex = arrIndex + 20;
    sortArr.splice(arrIndex, 0, -1);
    arrIndex++;
  }
  // 最后一页，非表情全部由-1占位
  while (sortArr.length % 7 != 0) {
    sortArr.splice(sortArr.length - 1, 0, -1);
  }
  // 每行显示7个表情，格式化面板序号数组，但此方法有bug，换行之后得第一个字符是逗号（，）
  arrLength = sortArr.length;
  arrIndex = 0;
  while (arrIndex < arrLength) {
    arrIndex = arrIndex + 7;
    sortArr.splice(arrIndex, 0, '\n');
    arrIndex++;
  }

  var sortArrString = sortArr.toString();
  res = res.concat('sortArr = \n [ \n' + sortArrString + '\n ] \n');


  // console.log(res); // 控制台输出所有拼接的文本
  return res;
}

var w_content = getAllFiles(root_path);

// 结果写文件
fs.readFile(w_file, function (err, data) {
  if (err && err.errno == 33) {
    fs.open(w_file, "w", 0666, function (e, fd) {
      if (e) throw e;
      fs.write(fd, w_content, 0, 'utf8', function (e) {
        if (e) throw e;
        fs.closeSync(fd);
      })
    });
  } else {
    fs.writeFile(w_file, w_content, function (e) {
      if (e) throw e
    })
  }
})