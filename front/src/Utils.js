import moment from "moment-jalaali";
import UiSetting from "./UiSetting";

class Utils {
  static direction = UiSetting.GetSetting("DefaultPageDirection");
  static DateUtil = (today) => {
    const m = moment(today);
    return {
      week: m.format("dddd"),
      day: m.format("jD"),
      month: m.format("jMMMM"),
      year: m.format("jYYYY"),
      time: m.format("HH:mm"),
    };
  };

  static CopyTextToClipBoard = (text) => {
    const input = window.document.createElement("input");
    window.document.body.append(input);
    input.value = text;
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
    window.document.body.removeChild(input);
  };

  static TableToExcel = (table, name) => {
    let uri = "data:application/vnd.ms-excel;base64,",
      template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/><x:Display${
        Utils.direction === "rtl" ? "RightToLeft" : "LeftToRight"
      }/> </x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>`,
      base64 = function(s) {
        return window.btoa(unescape(encodeURIComponent(s)));
      },
      format = function(s, c) {
        return s.replace(/{(\w+)}/g, function(m, p) {
          return c[p];
        });
      };

    if (!table.nodeType) table = document.getElementById(table);
    let ctx = { worksheet: name || "Worksheet", table: table.innerHTML };
    window.location.href = uri + base64(format(template, ctx));
  };

  static getFileExtension = (filename) => {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
  };

  static isCapsLockOn = (e) => {
    e = e ? e : window.event;
    e = e.nativeEvent || e;

    let charCode = false;
    if (e.which) {
      charCode = e.which;
    } else if (e.keyCode) {
      charCode = e.keyCode;
    }

    let shifton = false;
    if (e.shiftKey) {
      shifton = e.shiftKey;
    } else if (e.modifiers) {
      shifton = !!(e.modifiers & 4);
    }

    if (charCode >= 97 && charCode <= 122 && shifton) {
      return true;
    }

    if (charCode >= 65 && charCode <= 90 && !shifton) {
      return true;
    }

    return false;
  };

  //بررسی صحت کد ملی
  static isNationalCode = (code) => {
    if (!code) return;
    code = code.toString();
    let length = code.length;
    if (length != 10) return false;

    let sum = 0;
    let index = length;
    while (index > 1) {
      let digit = code[length - index];
      let calc = digit * index;
      //console.log(digit + ' - ' + index);
      sum += calc;
      index--;
    }

    let mod = sum % 11;

    if (mod < 2 && code[length - index] == mod) return true;
    else if (mod >= 2 && parseInt(code[length - index]) + parseInt(mod) == 11)
      return true;
    return false;
  };

  static isValidEmail = (email) => {
    if (!email) return;
    email = email.toString();
    let emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
  };

  static hashCode(string) {
    string = string + "";
    let hash = 0,
      i,
      chr;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
      chr = string.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  static toString(value) {
    return Utils.isDefine(value) ? value : "";
  }

  static isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  static getFileSizeTitle(fileSize, isEnglish) {
    const persian = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
    const english = ["B", "KB", "MB", "GB"];
    const sizeList = isEnglish ? english : persian;

    if (fileSize < 1024) {
      return fileSize + " " + sizeList[0];
    } else if (fileSize >= 1024 && fileSize < 1048576) {
      let real = Math.round(fileSize / 1024);
      return real + " " + sizeList[1];
    } else if (fileSize >= 1048576 && fileSize < 1073741824) {
      let real = Math.round(fileSize / 1048576);
      return real + " " + sizeList[2];
    } else if (fileSize >= 1073741824) {
      let real = Math.round(fileSize / 1073741824);
      return real + " " + sizeList[3];
    }
  }

  static currencyFormat(currency) {
    if (currency === undefined || isNaN(currency)) {
      return "نا مشخص";
    } else if (!currency) {
      return "رایگان";
    } else {
      if (currency < 0 || currency > 100000000000000) return currency;
      let a = 1000,
        b = 10,
        c = [
          "تومان",
          "هزار تومان",
          "میلیون تومان",
          "میلیارد تومان",
          "تیلیارد تومان",
        ],
        d = Math.floor(Math.log(currency) / Math.log(a));
      return parseFloat((currency / Math.pow(a, d)).toFixed(b)) + " " + c[d];
    }
  }

  static getCurrentDataTime() {
    return moment().format("jYYYY/jMM/jDD HH:mm:ss");
  }

  static getDateLocalFormat(date, isEnglish) {
    if (!date) {
      return "";
    }

    if (isEnglish) {
      return moment(date).format("YYYY-MM-DD");
    }

    try {
      date = moment(date);
      let now = moment();
      const next = "فردا به بعد";
      let Else = "این ماه";
      //same month
      if (date.jMonth() !== now.jMonth()) {
        Else = date.format("jMMMM");
      }
      //same year
      if (date.jYear() !== now.jYear()) {
        Else = date.format("jMMMM");
        Else += " " + date.jYear();
        Else = Else.toPersianDigits();
      }
      return date.calendar(null, {
        sameDay: "امروز",
        nextDay: "فردا",
        nextWeek: Else,
        lastDay: "دیروز",
        lastWeek: "این هفته",
        sameElse: Else,
      });
    } catch (e) {}

    return "نا مشخص";
  }

  // Version 4.0
  // Shade (Lighten or Darken)
  // pSBC ( 0.42, color2 ); // rgb(20,60,200) + [42% Lighter] => rgb(166,171,225)
  // pSBC ( -0.4, color5 ); // #F3A + [40% Darker] => #c62884
  static pSBC = (p, c0, c1, l) => {
    let pSBCr;
    let r,
      g,
      b,
      P,
      f,
      t,
      h,
      i = parseInt,
      m = Math.round,
      a = typeof c1 == "string";
    if (
      typeof p != "number" ||
      p < -1 ||
      p > 1 ||
      typeof c0 != "string" ||
      (c0[0] != "r" && c0[0] != "#") ||
      (c1 && !a)
    )
      return null;
    if (!pSBCr)
      pSBCr = (d) => {
        let n = d.length,
          x = {};
        if (n > 9) {
          [r, g, b, a] = d = d.split(",");
          n = d.length;
          if (n < 3 || n > 4) return null;
          x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4));
          x.g = i(g);
          x.b = i(b);
          x.a = a ? parseFloat(a) : -1;
        } else {
          if (n == 8 || n == 6 || n < 4) return null;
          if (n < 6)
            d =
              "#" +
              d[1] +
              d[1] +
              d[2] +
              d[2] +
              d[3] +
              d[3] +
              (n > 4 ? d[4] + d[4] : "");
          d = i(d.slice(1), 16);
          if (n == 9 || n == 5) {
            x.r = (d >> 24) & 255;
            x.g = (d >> 16) & 255;
            x.b = (d >> 8) & 255;
            x.a = m((d & 255) / 0.255) / 1000;
          } else {
            x.r = d >> 16;
            x.g = (d >> 8) & 255;
            x.b = d & 255;
            x.a = -1;
          }
        }
        return x;
      };
    h = c0.length > 9;
    h = a ? (c1.length > 9 ? true : c1 == "c" ? !h : false) : h;
    f = pSBCr(c0);
    P = p < 0;
    t =
      c1 && c1 != "c"
        ? pSBCr(c1)
        : P
        ? {
            r: 0,
            g: 0,
            b: 0,
            a: -1,
          }
        : { r: 255, g: 255, b: 255, a: -1 };
    p = P ? p * -1 : p;
    P = 1 - p;
    if (!f || !t) return null;
    if (l) {
      r = m(P * f.r + p * t.r);
      g = m(P * f.g + p * t.g);
      b = m(P * f.b + p * t.b);
    } else {
      r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5);
      g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5);
      b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    }
    a = f.a;
    t = t.a;
    f = a >= 0 || t >= 0;
    a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
    if (h)
      return (
        "rgb" +
        (f ? "a(" : "(") +
        r +
        "," +
        g +
        "," +
        b +
        (f ? "," + m(a * 1000) / 1000 : "") +
        ")"
      );
    else
      return (
        "#" +
        (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0))
          .toString(16)
          .slice(1, f ? undefined : -2)
      );
  };

  static isEqual(param1, param2) {
    //!! change value to boolean
    return !!param1 === !!param2;
  }

  static isDefine(value) {
    return value || value === 0;
  }

  static toTildaList(list) {
    return "~" + list.join("~") + "~";
  }

  static deepCompare() {
    let i, l, leftChain, rightChain;

    function compare2Objects(x, y) {
      let p;

      // remember that NaN === NaN returns false
      // and isNaN(undefined) returns true
      if (
        isNaN(x) &&
        isNaN(y) &&
        typeof x === "number" &&
        typeof y === "number"
      ) {
        return true;
      }

      // Compare primitives and functions.
      // Check if both arguments link to the same object.
      // Especially useful on the step where we compare prototypes
      if (x === y) {
        return true;
      }

      // Works in case when functions are created in constructor.
      // Comparing dates is a common scenario. Another built-ins?
      // We can even handle functions passed across iframes
      if (
        (typeof x === "function" && typeof y === "function") ||
        (x instanceof Date && y instanceof Date) ||
        (x instanceof RegExp && y instanceof RegExp) ||
        (x instanceof String && y instanceof String) ||
        (x instanceof Number && y instanceof Number)
      ) {
        return x.toString() === y.toString();
      }

      // At last checking prototypes as good as we can
      if (!(x instanceof Object && y instanceof Object)) {
        return false;
      }

      if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
      }

      if (x.constructor !== y.constructor) {
        return false;
      }

      if (x.prototype !== y.prototype) {
        return false;
      }

      // Check for infinitive linking loops
      if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
        return false;
      }

      // Quick checking of one object being a subset of another.
      // todo: cache the structure of arguments[0] for performance
      for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false;
        } else if (typeof y[p] !== typeof x[p]) {
          return false;
        }
      }

      for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false;
        } else if (typeof y[p] !== typeof x[p]) {
          return false;
        }

        switch (typeof x[p]) {
          case "object":
          case "function":
            leftChain.push(x);
            rightChain.push(y);

            if (!compare2Objects(x[p], y[p])) {
              return false;
            }

            leftChain.pop();
            rightChain.pop();
            break;

          default:
            if (x[p] !== y[p]) {
              return false;
            }
            break;
        }
      }

      return true;
    }

    if (arguments.length < 1) {
      return true; //Die silently? Don't know how to handle such case, please help...
      // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {
      leftChain = []; //Todo: this can be cached
      rightChain = [];

      if (!compare2Objects(arguments[0], arguments[i])) {
        return false;
      }
    }

    return true;
  }

  static pushDistinc(list, item, prop) {
    const index = list.findIndex((i) => Utils.deepCompare(i[prop], item[prop]));
    if (index === -1) {
      list.push(item);
    } else {
      list[index] = item;
    }
    return item;
  }

  static getType(obj) {
    return {}.toString
      .call(obj)
      .match(/\s([a-zA-Z]+)/)[1]
      .toLowerCase();
  }

  static listToObjectByProp(list, prop) {
    const temp = {};
    list.forEach((item) => (temp[item[prop]] = item));
    return temp;
  }

  static mergeObject(toObj, fromObj) {
    function isObject(item) {
      return item && typeof item === "object" && !Array.isArray(item);
    }

    function mergeDeep(target, source) {
      let output = Object.assign({}, target);
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
          if (isObject(source[key])) {
            if (!(key in target)) Object.assign(output, { [key]: source[key] });
            else output[key] = mergeDeep(target[key], source[key]);
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    }

    return mergeDeep(toObj, fromObj);
  }

  static isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  /***
   * return true if object is number string or non string
   * @param object
   * @return boolean
   */
  static isNumber(object) {
    return !isNaN(parseFloat(object)) && isFinite(object);
    // return object !== null && object !== '' && !isNaN(object)
  }

  /***
   * remove item from array
   * return true if success
   * @param array
   * @param item
   * @return boolean
   */
  static removeFromArray(array, item) {
    let index;
    if (array && array.indexOf && (index = array.indexOf(item)) !== -1) {
      return array.splice(index, 1);
    }
    return false;
  }

  /***
   * return array as string
   * comma come between items
   * @param array
   * @param comma
   * @return String
   */
  static arrayToString(array, comma) {
    let temp = "";
    array.forEach((item) => (temp += item + comma));
    return temp.substr(0, temp.length - comma.length) || "";
  }

  /***
   * return array as string
   * comma come between items
   * @param array
   * @param comma
   * @return String
   */
  // static findReactElement(node) {
  //   for (let key in node) {
  //     if (key && key.startsWith && key.startsWith("__reactInternalInstance$")) {
  //       return node[key]._debugOwner.stateNode;
  //     }
  //   }
  //   return null;
  // }

  static arrayEqual(a1, a2) {
    return a1.length === a2.length && a1.every((i) => a2.includes(i));
  }

  static toFlattenArray(object) {
    return (
      [].concat
        .apply([], [object])
        .filter((value) => value !== undefined && value !== null) || []
    );
  }

  static getObjectByNamespace(object, namespaceArray) {
    let temp = object;
    namespaceArray.forEach((n) => (temp = temp[n]));
    return temp;
  }

  static getBoolean(value) {
    switch (value) {
      case "false":
      case "False":
      case "0":
      case "":
      case 0:
        return false;
      default:
        return !!value;
    }
  }

  static getErrorText(error, fieldInfo) {
    const errorValue = fieldInfo[error];

    switch (error) {
      case "require":
        // return "این مورد الزامی است "
        return UiSetting.GetSetting("language") === "en"
          ? "Mandatory"
          : "الزامی";
      case "text_MaxLength":
        return `حداکثر ${errorValue} کاراکتر `;
      case "text_MinLength":
        return `حداقل ${errorValue} کاراکتر `;
      case "text_RegExp":
        if (fieldInfo.text_RegExp_Error) {
          return fieldInfo.text_RegExp_Error;
        }

        return `به صورت ${errorValue} باشد`;
      case "text_AllowedChars":
        return `تنها این کاراکتر ها ${errorValue} مجاز است`;
      case "text_notAllowedChars":
        return ` این کاراکتر ها ${errorValue} مجاز نیستند`;
      case "number":
        return `فقط مقدار عددی`;
      case "number_FloatAllowed":
        return `اعشار مجاز نمی باشد`;
      case "number_FloatMaxPrecision":
        return `تنها تا  ${errorValue} رقم اعشار `;
      case "number_MinDigit":
        return `حداقل ${errorValue} رقم `;
      case "number_MaxDigit":
        return `حداکثر ${errorValue} رقم `;
      case "number_MinValue":
        return `حداقل ${errorValue}  `;
      case "number_MaxValue":
        return `Maximum ${errorValue}  `;

      case "json":
        return `متن مورد نظر جِیسون نمی باشد!`;

      default:
        return error;
    }
  }

  static isObjectAndNotEmpty(obj) {
    if (!obj) return;
    return obj.constructor === Object && Object.keys(obj || {}).length > 0;
  }

  static getErrorList(errorList, fieldInfo) {
    return errorList
      .map((error) => Utils.getErrorText(error, fieldInfo))
      .join(" , ");
  }

  static endString(string, endString) {
    string = (string + "").trim();
    return string.endsWith(endString) ? string : string + endString;
  }

  static latLong_GetArrayFromText(strLatLong) {
    if (!strLatLong || !strLatLong.length || strLatLong.length === 0)
      return null;

    let indexOfComma = strLatLong.indexOf(",");
    if (
      !indexOfComma ||
      indexOfComma === 0 ||
      indexOfComma === strLatLong.length
    )
      return null;

    let strLat = strLatLong.substr(0, indexOfComma);
    let strlong = strLatLong.substr(indexOfComma + 1);

    if (isNaN(strLat) || isNaN(strlong)) return;

    return [strLat, strlong];
  }

  static color_MixTwoColors(color1, color2, ratio) {
    // var color2 = 'FF0000';
    // var color1 = '00FF00';
    // var ratio = 0.5;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;

    if (color1.startsWith("#")) color1 = color1.substr(1);

    if (color2.startsWith("#")) color2 = color2.substr(1);

    var hex = function(x) {
      x = x.toString(16);
      return x.length == 1 ? "0" + x : x;
    };

    var r = Math.ceil(
      parseInt(color2.substring(0, 2), 16) * ratio +
        parseInt(color1.substring(0, 2), 16) * (1 - ratio)
    );
    var g = Math.ceil(
      parseInt(color2.substring(2, 4), 16) * ratio +
        parseInt(color1.substring(2, 4), 16) * (1 - ratio)
    );
    var b = Math.ceil(
      parseInt(color2.substring(4, 6), 16) * ratio +
        parseInt(color1.substring(4, 6), 16) * (1 - ratio)
    );

    var middle = "#" + hex(r) + hex(g) + hex(b);
    return middle;
  }
}

export default Utils;
