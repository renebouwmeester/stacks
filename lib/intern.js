// lib/intern.js — GEKOPIEERD uit deep-roon-mcp 0.5.4 @ dee0ffd door intern/kopieer-intern.mjs op 2026-10-26.
// Niet met de hand bewerken. Bevat Roon's interne protocol via Arthur Soares' roon-api-reverse-engineering (zie deep-roon-mcp/NOTICE).
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target2, all) => {
  for (var name in all)
    __defProp(target2, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../deep-roon-mcp/node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target2 = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target2.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target2.buffer, target2.byteOffset, offset);
      }
      return target2;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target2 = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target2[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target2[0] |= 64;
        target2[1] = payloadLength;
        if (payloadLength === 126) {
          target2.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target2[2] = target2[3] = 0;
          target2.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target2, data];
        target2[1] |= 128;
        target2[offset - 4] = mask[0];
        target2[offset - 3] = mask[1];
        target2[offset - 2] = mask[2];
        target2[offset - 1] = mask[3];
        if (skipMasking) return [target2, data];
        if (merge) {
          applyMask(data, mask, target2, offset, dataLength);
          return [target2];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target2, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http = require("http");
    var net2 = require("net");
    var tls = require("tls");
    var { randomBytes: randomBytes2, createHash } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            if (!options || options.protocols === void 0) {
              protocols = [];
            } else if (Array.isArray(options.protocols)) {
              protocols = options.protocols;
            } else {
              protocols = [options.protocols];
            }
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              if (options.protocols === void 0) {
                protocols = [];
              } else if (Array.isArray(options.protocols)) {
                protocols = options.protocols;
              } else {
                protocols = [options.protocols];
              }
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._readyState = _WebSocket.CLOSING;
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        protocols: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes2(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net2.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net2.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close2() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close2() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open2() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open2() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// ../deep-roon-mcp/node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "../deep-roon-mcp/node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http = require("http");
    var { Duplex } = require("stream");
    var { createHash } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// intern/ingang.ts
var ingang_exports = {};
__export(ingang_exports, {
  album: () => album,
  closeSoon: () => closeSoon,
  library: () => library2,
  shutdown: () => shutdown,
  zetGekoppeld: () => zetGekoppeld
});
module.exports = __toCommonJS(ingang_exports);

// ../deep-roon-mcp/src/intern/proto/connection.ts
var net = __toESM(require("net"));
var crypto = __toESM(require("crypto"));
var MAGIC = Buffer.from("ROON");
var CONNECT_REQUEST_TEMPLATE = "470181670000000100012c536f6f6c6f6f732e4d73672e446973747269627574656442726f6b65722e436f6e6e6563745265717565737424840e436c69656e7442726f6b65724964XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX228110436c69656e7442726f6b65724e616d650000000848512d30303435321b810f50726f746f636f6c56657273696f6e0000000232383e810c50726f746f636f6c48617368000000286161656464323265326536653435323233316537346464333039666662396432376139373531656420810c436c69656e744272616e63680000000a70726f64756374696f6e05030503";
var RoonConnection = class {
  constructor(opts) {
    this.opts = opts;
  }
  opts;
  socket = null;
  dataHandler = () => {
  };
  established = false;
  clientBrokerId = crypto.randomBytes(16);
  /**
   * Fired when the socket closes for any reason (explicit close(), peer
   * disconnect, error) so the remoting layer can fail in-flight requests
   * immediately instead of waiting out their timeouts. Fires at most once per
   * socket attempt: a connect() that fails before establishment consumes its
   * own notification, and a retried connect() re-arms it.
   */
  onclosed = () => {
  };
  onclosedFired = false;
  fireOnclosed() {
    if (this.onclosedFired) return;
    this.onclosedFired = true;
    this.onclosed();
  }
  onData(handler) {
    this.dataHandler = handler;
  }
  send(data) {
    if (!this.socket) throw new Error("not connected");
    this.socket.write(data);
  }
  /** Complete TCP + ROON handshake + ConnectRequest; resolves when remoting is live. */
  connect() {
    const { host, port = 9332, serverBrokerId } = this.opts;
    return new Promise((resolve, reject) => {
      if (this.established) {
        reject(
          new Error("RoonConnection cannot reconnect after an established session; create a new instance")
        );
        return;
      }
      const socket = new net.Socket();
      this.socket = socket;
      this.onclosedFired = false;
      let step = 0;
      socket.setTimeout(2e4);
      const fail = (e) => {
        socket.destroy();
        reject(e);
      };
      socket.on("timeout", () => fail(new Error("connection timed out during handshake")));
      socket.on("error", fail);
      socket.on("close", () => {
        if (this.socket !== socket) return;
        this.socket = null;
        this.fireOnclosed();
      });
      socket.on("connect", () => {
        step = 1;
        socket.write(Buffer.concat([MAGIC, Buffer.from([1, 4]), serverBrokerId, this.clientBrokerId]));
      });
      const ACK_RECORD_LEN = 6;
      const SESSION_RECORD_LEN = 22;
      let pending = Buffer.alloc(0);
      socket.on("data", (data) => {
        if (this.established) {
          this.dataHandler(data);
          return;
        }
        pending = pending.length === 0 ? data : Buffer.concat([pending, data]);
        for (; ; ) {
          if (step === 1 || step === 2) {
            if (pending.length < ACK_RECORD_LEN) return;
            if (pending.subarray(0, 4).toString() !== "ROON") {
              fail(new Error(`unexpected non-ROON bytes during handshake (step ${step})`));
              return;
            }
            const code = pending[5];
            if (step === 1 && code === 128) {
              pending = pending.subarray(ACK_RECORD_LEN);
              step = 2;
              socket.write(Buffer.concat([MAGIC, Buffer.from([1, 2])]));
              continue;
            }
            if (step === 2 && code === 130) {
              if (pending.length < SESSION_RECORD_LEN) return;
              pending = pending.subarray(SESSION_RECORD_LEN);
              step = 3;
              const cr = Buffer.from(
                CONNECT_REQUEST_TEMPLATE.replace(
                  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                  this.clientBrokerId.toString("hex")
                ),
                "hex"
              );
              socket.write(cr);
              continue;
            }
            fail(new Error(`unexpected handshake reply 0x${code.toString(16)} at step ${step}`));
            return;
          }
          if (step === 3) {
            if (pending.length === 0) return;
            socket.setTimeout(0);
            this.established = true;
            const rest = pending;
            pending = Buffer.alloc(0);
            resolve();
            this.dataHandler(rest);
            return;
          }
          return;
        }
      });
      socket.on("close", () => {
        if (!this.established) reject(new Error("connection closed during handshake"));
      });
      socket.connect(port, host);
    });
  }
  close() {
    this.socket?.destroy();
    this.socket = null;
    this.fireOnclosed();
  }
};

// ../deep-roon-mcp/src/intern/proto/flex.ts
function writeFlexInt(out, value) {
  const u = value >>> 0;
  if (u <= 127) {
    out.push(u);
  } else if (u <= 16383) {
    out.push(128 | u >>> 7, u & 127);
  } else if (u <= 2097151) {
    out.push(128 | u >>> 14, 128 | u >>> 7, u & 127);
  } else if (u <= 268435455) {
    out.push(128 | u >>> 21, 128 | u >>> 14, 128 | u >>> 7, u & 127);
  } else {
    out.push(
      128 | u >>> 28,
      128 | u >>> 21 & 127,
      128 | u >>> 14 & 127,
      128 | u >>> 7 & 127,
      u & 127
    );
  }
}
function writeFlexLong(out, value) {
  let u = BigInt(value) & 0xffffffffffffffffn;
  const groups = [];
  if (u === 0n) {
    out.push(0);
    return;
  }
  while (u > 0n) {
    groups.push(Number(u & 0x7fn));
    u >>= 7n;
  }
  groups.reverse();
  for (let i = 0; i < groups.length; i++) {
    out.push(i === groups.length - 1 ? groups[i] : 128 | groups[i]);
  }
}
function readFlexLong(buf, pos) {
  let num = 0n;
  for (; ; ) {
    const b = buf[pos++];
    num = num << 7n | BigInt(b & 127);
    if ((b & 128) === 0) break;
  }
  return [num, pos];
}

// ../deep-roon-mcp/src/intern/proto/frame.ts
function encodeRequest(cmd, body, rid) {
  const out = [];
  if (rid !== null) {
    out.push(cmd & 63 | 64);
    writeFlexInt(out, rid);
  } else {
    out.push(cmd & 63);
  }
  writeFlexInt(out, body.length);
  return Buffer.concat([Buffer.from(out), Buffer.from(body)]);
}
function encodeResponse(rid, body, isFinal = true) {
  const out = [128 | (isFinal ? 64 : 0)];
  writeFlexInt(out, rid);
  writeFlexInt(out, body.length);
  return Buffer.concat([Buffer.from(out), Buffer.from(body)]);
}
var FrameParser = class {
  buf = Buffer.alloc(0);
  push(chunk) {
    this.buf = this.buf.length ? Buffer.concat([this.buf, chunk]) : chunk;
    const frames = [];
    for (; ; ) {
      const parsed = this.tryParseOne();
      if (!parsed) break;
      frames.push(parsed);
    }
    return frames;
  }
  tryParseOne() {
    if (this.buf.length < 2) return null;
    const u = this.buf;
    const flex = (pos2) => {
      let num = 0;
      for (; ; ) {
        if (pos2 >= u.length) return null;
        const b2 = u[pos2++];
        num = num << 7 | b2 & 127;
        if ((b2 & 128) === 0) break;
      }
      return [num >>> 0, pos2];
    };
    let pos = 1;
    const b = u[0];
    const isResponse = (b & 128) !== 0;
    let cmd = 0;
    let rid = null;
    let isFinal = false;
    if (!isResponse) {
      cmd = b & 63;
      if ((b & 64) !== 0) {
        const r = flex(pos);
        if (!r) return null;
        [rid, pos] = r;
      }
    } else {
      isFinal = (b & 64) !== 0;
      const r = flex(pos);
      if (!r) return null;
      [rid, pos] = r;
    }
    const lenR = flex(pos);
    if (!lenR) return null;
    const [bodyLen, bodyStart] = lenR;
    if (u.length < bodyStart + bodyLen) return null;
    const frame = {
      isResponse,
      cmd,
      rid,
      isFinal,
      body: Buffer.from(u.subarray(bodyStart, bodyStart + bodyLen))
    };
    this.buf = this.buf.subarray(bodyStart + bodyLen);
    return frame;
  }
};

// ../deep-roon-mcp/src/intern/proto/writer.ts
var BinaryWriter = class {
  out = [];
  get length() {
    return this.out.length;
  }
  toBuffer() {
    return Buffer.from(this.out);
  }
  /** Raw bytes, no framing. */
  bytes(b) {
    for (const x of b) this.out.push(x);
    return this;
  }
  byte(b) {
    this.out.push(b & 255);
    return this;
  }
  // --- RemotingUtils primitives ---
  /** WriteInteger == WriteFlexInt (signed int; -1 encodes as uint32 0xFFFFFFFF). */
  integer(v) {
    writeFlexInt(this.out, v);
    return this;
  }
  flexInt(v) {
    writeFlexInt(this.out, v);
    return this;
  }
  long(v) {
    writeFlexLong(this.out, v);
    return this;
  }
  boolean(v) {
    this.out.push(v ? 1 : 0);
    return this;
  }
  /** WriteString: integer(utf8.length) + utf8 bytes; null -> integer(-1). */
  string(v) {
    if (v === null || v === void 0) {
      this.integer(-1);
      return this;
    }
    const utf8 = Buffer.from(v, "utf8");
    this.integer(utf8.length);
    return this.bytes(utf8);
  }
  /** WriteOptionalString: null -> integer(-1), else WriteString. */
  optionalString(v) {
    return v === null || v === void 0 ? this.integer(-1) : this.string(v);
  }
  /** WriteSooid: integer(bytes.length) + bytes. Sooid is a raw byte id. */
  sooid(bytes) {
    this.integer(bytes.length);
    return this.bytes(bytes);
  }
  optionalSooid(bytes) {
    if (bytes === null || bytes === void 0) {
      return this.integer(-1);
    }
    return this.sooid(bytes);
  }
  /** WriteGuid: 16 raw bytes in .NET Guid.ToByteArray() order. */
  guid(guid16) {
    if (guid16.length !== 16) throw new Error("guid must be 16 bytes");
    return this.bytes(guid16);
  }
  /** WriteDouble: little-endian IEEE-754 (BitConverter.GetBytes). */
  double(v) {
    const b = Buffer.alloc(8);
    b.writeDoubleLE(v, 0);
    return this.bytes(b);
  }
  float(v) {
    const b = Buffer.alloc(4);
    b.writeFloatLE(v, 0);
    return this.bytes(b);
  }
  /** WriteByteArray: integer(len) + bytes; null -> integer(-1). */
  byteArray(v) {
    if (v === null || v === void 0) return this.integer(-1);
    this.integer(v.length);
    return this.bytes(v);
  }
  // --- Optionals that use a trailing marker (C#: value, or marker byte 2) ---
  optionalBoolean(v) {
    if (v === null || v === void 0) this.out.push(2);
    else this.out.push(v ? 1 : 0);
    return this;
  }
};

// ../deep-roon-mcp/src/intern/proto/remoting.ts
var Cmd = {
  PING: 1,
  GETSVC: 2,
  CALL: 3,
  GCOBJS: 4,
  DEFTYPE: 5,
  DEFMETHOD: 6,
  SENDMSG: 7
};
function isSuccessStatus(status) {
  return status === "Success" || status === "";
}
var RemotingClient = class {
  constructor(transport, requestTimeoutMs = 15e3) {
    this.transport = transport;
    this.requestTimeoutMs = requestTimeoutMs;
    transport.onData((chunk) => {
      for (const frame of this.parser.push(chunk)) this.handleFrame(frame);
    });
  }
  transport;
  requestTimeoutMs;
  parser = new FrameParser();
  ridCounter = 0;
  methodNameToId = /* @__PURE__ */ new Map();
  nextMethodId = 1;
  definedMethods = /* @__PURE__ */ new Set();
  pending = /* @__PURE__ */ new Map();
  /** Called with every inbound request frame (server push). */
  onPush = () => {
  };
  nextRid() {
    this.ridCounter = this.ridCounter + 1 & 2147483647;
    return this.ridCounter;
  }
  /** Get (assigning if new) the local method id for a signature string. */
  methodId(signature) {
    let id = this.methodNameToId.get(signature);
    if (id === void 0) {
      id = this.nextMethodId++;
      this.methodNameToId.set(signature, id);
    }
    return id;
  }
  /** DEFMETHOD on first use: declare (methodId, signature) to the server. */
  ensureDefined(methodId, signature) {
    if (this.definedMethods.has(methodId)) return;
    this.definedMethods.add(methodId);
    const body = new BinaryWriter().flexInt(methodId).string(signature).toBuffer();
    this.transport.send(encodeRequest(Cmd.DEFMETHOD, body, null));
  }
  // The receiver maps remote IDs to local types, but stores property mappings
  // by LOCAL type ID. Multiple schemas for one typename overwrite each other.
  clientTypes = /* @__PURE__ */ new Map();
  nextClientTypeId = 1;
  /** Declare one immutable ordered schema per type for this session. */
  defineType(typeName, members = []) {
    const schema = JSON.stringify(members.map(({ name, propType }) => [name, propType]));
    const existing = this.clientTypes.get(typeName);
    if (existing) {
      if (existing.schema !== schema) throw new Error(`incompatible schema for ${typeName}: use the full canonical schema`);
      return existing.id;
    }
    if (new Set(members.map((m) => m.name)).size !== members.length) {
      throw new Error(`duplicate members in schema for ${typeName}`);
    }
    const id = this.nextClientTypeId++;
    const w = new BinaryWriter().flexInt(id).string(typeName).flexInt(members.length);
    for (const m of members) w.string(m.name).integer(m.propType);
    this.transport.send(encodeRequest(Cmd.DEFTYPE, w.toBuffer(), null));
    this.clientTypes.set(typeName, { id, schema });
    return id;
  }
  /** Low-level: send a request that expects a response; resolves with the final frame. */
  request(cmd, body) {
    const rid = this.nextRid();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(rid);
        reject(new Error(`remoting request ${rid} (cmd ${cmd}) timed out`));
      }, this.requestTimeoutMs);
      this.pending.set(rid, { chunks: [], resolve, reject, timer });
      try {
        this.transport.send(encodeRequest(cmd, body, rid));
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(rid);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }
  /**
   * A keepalive round trip (added 8 Oct 2026): the Core reaps a session that sent nothing for ~30–35 s ("no keepalive
   * … reaping dead peer" in RoonServer_log); it answers a PING with an empty response.
   */
  ping() {
    return this.request(Cmd.PING, Buffer.alloc(0)).then(() => void 0);
  }
  /**
   * Fail every in-flight request immediately and clear the pending table.
   * Mirrors node-roon-api's moo.clean_up(): called when the connection closes
   * so callers get a prompt rejection instead of waiting out the request
   * timeout. Idempotent — safe to call from both the explicit close() path
   * and the socket 'close' event.
   */
  failPending(reason = "connection closed") {
    for (const [rid, p] of this.pending) {
      clearTimeout(p.timer);
      p.reject(new Error(`remoting request ${rid} failed: ${reason}`));
    }
    this.pending.clear();
  }
  /**
   * Call a method on an object. `signature` is the full DEFMETHOD string
   * (build with formatMethodSignature). `args` is the pre-serialized argument
   * block. Returns the parsed status + return-value bytes.
   */
  async callMethod(objectId, signature, args) {
    const mid = this.methodId(signature);
    this.ensureDefined(mid, signature);
    const body = new BinaryWriter().long(objectId).flexInt(mid).bytes(args).toBuffer();
    const frame = await this.request(Cmd.CALL, body);
    return this.parseCallResult(frame.body);
  }
  /** Fire-and-forget call (no ResultCallback param). */
  callMethodNoReply(objectId, signature, args) {
    const mid = this.methodId(signature);
    this.ensureDefined(mid, signature);
    const body = new BinaryWriter().long(objectId).flexInt(mid).bytes(args).toBuffer();
    this.transport.send(encodeRequest(Cmd.CALL, body, null));
  }
  /** GETSVC: resolve a service GUID to its object id. */
  async getService(guid16) {
    const body = new BinaryWriter().guid(guid16).toBuffer();
    const frame = await this.request(Cmd.GETSVC, body);
    const res = this.parseCallResult(frame.body);
    if (!res.success) throw new Error(`getService failed: ${res.status}`);
    const [oid] = readFlexLong(Uint8Array.from(res.payload), 0);
    return oid;
  }
  /** A response body begins with a status string ('' = Success). */
  parseCallResult(body) {
    const u = Uint8Array.from(body);
    let pos = 0;
    let num = 0;
    for (; ; ) {
      const b = u[pos++];
      num = num << 7 | b & 127;
      if ((b & 128) === 0) break;
    }
    const len = num >>> 0;
    let status = "";
    if (len === 4294967295) {
      status = "";
    } else {
      status = Buffer.from(u.subarray(pos, pos + len)).toString("utf8");
      pos += len;
    }
    return { status, success: isSuccessStatus(status), payload: Buffer.from(u.subarray(pos)) };
  }
  handleFrame(frame) {
    if (frame.isResponse) {
      const p = frame.rid !== null ? this.pending.get(frame.rid) : void 0;
      if (!p) return;
      p.chunks.push(frame.body);
      if (frame.isFinal) {
        clearTimeout(p.timer);
        this.pending.delete(frame.rid);
        const joined = p.chunks.length === 1 ? frame.body : Buffer.concat([...p.chunks]);
        p.resolve({ ...frame, body: joined });
      }
      return;
    }
    if (frame.cmd === Cmd.PING) {
      if (frame.rid !== null) this.transport.send(encodeResponse(frame.rid, Buffer.alloc(0)));
      return;
    }
    this.onPush(frame);
    if (frame.rid !== null && frame.cmd !== Cmd.PING) {
      this.transport.send(encodeResponse(frame.rid, Buffer.alloc(0)));
    }
  }
};

// ../deep-roon-mcp/src/intern/proto/reader.ts
var BinaryReader = class {
  constructor(buf) {
    this.buf = buf;
  }
  buf;
  pos = 0;
  get remaining() {
    return this.buf.length - this.pos;
  }
  flexInt() {
    let num = 0;
    for (; ; ) {
      const b = this.buf[this.pos++];
      num = num << 7 | b & 127;
      if ((b & 128) === 0) break;
    }
    return num >>> 0;
  }
  /** ReadInteger == ReadFlexInt, but lengths use -1 as a sentinel: interpret as signed. */
  integer() {
    const u = this.flexInt();
    return u | 0;
  }
  flexLong() {
    let num = 0n;
    for (; ; ) {
      const b = this.buf[this.pos++];
      num = num << 7n | BigInt(b & 127);
      if ((b & 128) === 0) break;
    }
    return num;
  }
  long() {
    return this.flexLong();
  }
  boolean() {
    return this.buf[this.pos++] !== 0;
  }
  bytes(n) {
    const b = Buffer.from(this.buf.subarray(this.pos, this.pos + n));
    this.pos += n;
    return b;
  }
  guid() {
    return this.bytes(16);
  }
  double() {
    const v = Buffer.from(this.buf.subarray(this.pos, this.pos + 8)).readDoubleLE(0);
    this.pos += 8;
    return v;
  }
  float() {
    const v = Buffer.from(this.buf.subarray(this.pos, this.pos + 4)).readFloatLE(0);
    this.pos += 4;
    return v;
  }
  char() {
    return this.integer();
  }
  dateTime() {
    return this.long();
  }
  /** ReadSooid: integer(len) + len bytes. */
  sooid() {
    const len = this.integer();
    return this.bytes(len);
  }
  /** ReadString: integer(len); -1 -> null, else len utf8 bytes. */
  string() {
    const len = this.integer();
    if (len < 0) return null;
    const s = Buffer.from(this.buf.subarray(this.pos, this.pos + len)).toString("utf8");
    this.pos += len;
    return s;
  }
  /** ReadByteArray: integer(len); -1 -> null, else len bytes. */
  byteArray() {
    const len = this.integer();
    if (len < 0) return null;
    return this.bytes(len);
  }
  // --- optionals ---
  optionalInteger() {
    return this.boolean() ? this.integer() : null;
  }
  optionalLong() {
    return this.boolean() ? this.long() : null;
  }
  optionalBoolean() {
    const b = this.buf[this.pos++];
    return b === 0 ? false : b === 1 ? true : null;
  }
  optionalGuid() {
    return this.boolean() ? this.guid() : null;
  }
  optionalSooid() {
    const len = this.integer();
    return len < 0 ? null : this.bytes(len);
  }
  optionalDouble() {
    return this.boolean() ? this.double() : null;
  }
  optionalFloat() {
    return this.boolean() ? this.float() : null;
  }
  optionalChar() {
    return this.boolean() ? this.char() : null;
  }
  optionalDateTime() {
    return this.optionalLong();
  }
};

// ../deep-roon-mcp/src/intern/proto/objects.ts
function isRef(v) {
  return typeof v === "object" && v !== null && "$ref" in v;
}
function isCollectionType(typeName) {
  return /(^|\.)(DataList|Query|VirtualQuery)</.test(typeName) || /\.Query$/.test(typeName);
}
var ObjectGraph = class {
  types = /* @__PURE__ */ new Map();
  objects = /* @__PURE__ */ new Map();
  // key = oid.toString()
  /** Feed one inbound server frame. Returns true if it was an object/type frame. */
  ingest(frame) {
    if (frame.isResponse) return false;
    const r = new BinaryReader(Uint8Array.from(frame.body));
    switch (frame.cmd) {
      case 7:
        this.defineType(r);
        return true;
      // DEFTYPE
      case 3:
        this.pushObj(r, true);
        return true;
      // PUSHOBJ (populate)
      case 4:
        this.pushObj(r, false);
        return true;
      // PUSHSTUB (no fields)
      case 5:
        this.pushObj(r, true);
        return true;
      // UPDATEOBJ (re-populate)
      default:
        return false;
    }
  }
  defineType(r) {
    const id = r.flexInt();
    const name = r.string() ?? "";
    const count = r.flexInt();
    const members = [];
    for (let i = 0; i < count; i++) {
      const mname = r.string() ?? "";
      const propType = r.integer();
      members.push({ name: mname, propType });
    }
    this.types.set(id, { id, name, members });
  }
  pushObj(r, populate) {
    const oid = r.flexLong();
    const typeId = r.flexInt();
    const def = this.types.get(typeId);
    const typeName = def?.name ?? `#${typeId}`;
    const fields = {};
    if (populate && def) {
      const dataList = /(?:^|\.)DataList<(.+)>$/.exec(typeName);
      if (dataList) {
        const primitives = {
          string: 20 /* String */,
          int: 0 /* Int */,
          long: 1 /* Long */,
          double: 5 /* Double */,
          float: 6 /* Float */,
          "System.DateTime": 8 /* DateTime */
        };
        const integerEnums = [
          "DsdStrategy",
          "MediaSource",
          "TidalStreamFormat",
          "QobuzStreamFormat",
          "KKBoxStreamFormat",
          "NugsStreamFormat"
        ];
        const elementType = dataList[1];
        const elementCodec = primitives[elementType] ?? (integerEnums.some((name) => elementType === `Sooloos.Broker.Api.${name}` || elementType === `Roon.Broker.Api.${name}`) ? 0 /* Int */ : 23 /* Object */);
        const count = r.integer();
        const items2 = [];
        for (let i = 0; i < count && r.remaining > 0; i++) {
          try {
            const item = this.readValue(r, elementCodec);
            if (r.remaining < 0) break;
            items2.push(item);
          } catch {
            break;
          }
        }
        fields.$count = r.pos > r.buf.length && items2.length === count ? -1 : count;
        fields.$items = items2;
      } else if (isCollectionType(typeName)) {
        let count = 0;
        for (; ; ) {
          const idx = r.flexInt();
          if (idx === 0) break;
          if (idx === 1) count = r.integer();
          else break;
        }
        const items2 = [];
        for (let i = 0; i < count && r.pos < r.buf.length; i++) {
          try {
            items2.push(this.readValue(r, 23 /* Object */));
          } catch {
            break;
          }
        }
        fields.$count = count;
        fields.$items = items2;
      } else {
        for (; ; ) {
          const idx = r.flexInt();
          if (idx === 0) break;
          const member2 = def.members[idx - 1];
          if (!member2) break;
          try {
            fields[member2.name] = this.readValue(r, member2.propType);
          } catch {
            break;
          }
        }
      }
    }
    const key = oid.toString();
    const existing = this.objects.get(key);
    if (existing) {
      if (populate) Object.assign(existing.fields, fields);
    } else {
      this.objects.set(key, { oid, typeId, typeName, fields });
    }
  }
  /** Read one member value per its PropertyType (ported from PropertyMapping). */
  readValue(r, t) {
    switch (t) {
      case 0 /* Int */:
        return r.integer();
      case 1 /* Long */:
        return r.long();
      case 2 /* Bool */:
        return r.boolean();
      case 3 /* Guid */:
        return r.guid();
      case 4 /* Sooid */:
        return r.sooid();
      case 5 /* Double */:
        return r.double();
      case 6 /* Float */:
        return r.float();
      case 7 /* Char */:
        return r.char();
      case 8 /* DateTime */:
        return r.dateTime();
      case 9 /* Enum */:
        return r.integer();
      case 10 /* NullableInt */:
        return r.optionalInteger();
      case 11 /* NullableLong */:
        return r.optionalLong();
      case 12 /* NullableBool */:
        return r.optionalBoolean();
      case 13 /* NullableGuid */:
        return r.optionalGuid();
      case 14 /* NullableSooid */:
        return r.optionalSooid();
      case 15 /* NullableDouble */:
        return r.optionalDouble();
      case 16 /* NullableFloat */:
        return r.optionalFloat();
      case 17 /* NullableChar */:
        return r.optionalChar();
      case 18 /* NullableDateTime */:
        return r.optionalDateTime();
      case 19 /* NullableEnum */:
        return r.optionalInteger();
      case 20 /* String */:
        return r.string();
      case 21 /* ByteArray */:
        return r.byteArray();
      case 22 /* Message */:
        return r.byteArray();
      case 23 /* Object */: {
        const marker = r.long();
        if (marker === 1n) {
          const tid = r.integer();
          const len = r.integer();
          const sub = new BinaryReader(r.bytes(len));
          const def = this.types.get(tid);
          if (!def) return { $inline: tid };
          const lijst = /(?:^|\.)DataList<(.+)>$/.exec(def.name);
          if (lijst) {
            const codec = { string: 20 /* String */, int: 0 /* Int */, long: 1 /* Long */, double: 5 /* Double */ };
            const el = codec[lijst[1]] ?? 23 /* Object */;
            const items2 = [];
            try {
              const count = sub.integer();
              for (let i = 0; i < count && sub.remaining > 0; i++) items2.push(this.readValue(sub, el));
            } catch {
            }
            return { $type: def.name, $count: items2.length, $items: items2 };
          }
          const obj2 = {};
          for (; ; ) {
            const idx = sub.flexInt();
            if (idx === 0) break;
            const m = def.members[idx - 1];
            if (!m) break;
            try {
              obj2[m.name] = this.readValue(sub, m.propType);
            } catch {
              break;
            }
          }
          return { $type: def.name, ...obj2 };
        }
        return marker === 0n ? null : { $ref: marker };
      }
      case 24 /* LengthPrefixed */: {
        const len = r.integer();
        return r.bytes(len);
      }
      default:
        throw new Error(`unknown PropertyType ${t}`);
    }
  }
  /**
   * Decode a single method-return value that was serialized with the `Object`
   * (GetObject) encoding — i.e. `flexLong(marker)` then, for marker==1, an inline
   * value object (typeId + length + sparse fields). Returns `{$type, ...fields}`
   * for an inline struct, `{$ref}` for a by-ref oid, or `null`. Used for by-value
   * returns like `GetAlbumEditInfo` whose result is not pushed into the graph.
   */
  decodeReturnValue(payload) {
    return this.readValue(new BinaryReader(payload), 23 /* Object */);
  }
  // --- queries ---
  /** All objects whose type name equals or ends with the given short name. */
  findByType(shortName) {
    const want = shortName.includes(".") ? shortName : `.${shortName}`;
    return [...this.objects.values()].filter(
      (o) => o.typeName === shortName || o.typeName.endsWith(want)
    );
  }
  getObject(oid) {
    return this.objects.get(oid.toString());
  }
};

// ../deep-roon-mcp/src/intern/catalog/signature.ts
var API_NS = "Sooloos.Broker.Api.";
var KEYWORD_PRIMITIVES = /* @__PURE__ */ new Set([
  "string",
  "bool",
  "double",
  "long",
  "int",
  "float",
  "char",
  "short",
  "object",
  "void"
]);
var EXPLICIT = {
  Sooid: "System.Sooid",
  Guid: "System.Guid",
  DateTime: "System.DateTime",
  TimeSpan: "System.TimeSpan",
  ResultCallback: "Base.ResultCallback",
  ResultPromise: "Base.ResultPromise"
  // byte[] is handled specially (System.Byte[]) in formatType.
};
var GENERIC_NS = {
  IEnumerable: "System.Collections.Generic.IEnumerable",
  IList: "System.Collections.Generic.IList",
  IReadOnlyList: "System.Collections.Generic.IReadOnlyList",
  ICollection: "System.Collections.Generic.ICollection",
  List: "System.Collections.Generic.List",
  IDictionary: "System.Collections.Generic.IDictionary",
  Dictionary: "System.Collections.Generic.Dictionary",
  Nullable: "System.Nullable"
};
function splitGeneric(s) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "<") depth++;
    else if (ch === ">") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
function formatType(t) {
  t = t.trim();
  if (t.endsWith("?")) {
    return formatType(t.slice(0, -1)) + "?";
  }
  if (t.endsWith("[]")) {
    const inner = t.slice(0, -2).trim();
    if (inner === "byte") return "System.Byte[]";
    return formatType(inner) + "[]";
  }
  const gm = t.match(/^([A-Za-z0-9_]+)<(.+)>$/);
  if (gm) {
    const outer = gm[1];
    const args = splitGeneric(gm[2]).map(formatType).join(", ");
    if (outer === "ResultCallback") return `Base.ResultCallback<${args}>`;
    if (outer === "ResultPromise") return `Base.ResultPromise<${args}>`;
    if (GENERIC_NS[outer]) return `${GENERIC_NS[outer]}<${args}>`;
    return `${API_NS}${outer}<${args}>`;
  }
  if (KEYWORD_PRIMITIVES.has(t)) return t;
  if (EXPLICIT[t]) return EXPLICIT[t];
  return `${API_NS}${t}`;
}
function formatMethodSignature(service, method, params) {
  const args = params.map((p) => formatType(p.type)).join(", ");
  return `${API_NS}${service}::${method}(${args})`;
}

// ../deep-roon-mcp/src/intern/proto/serializer.ts
var Arg = {
  sooid: (value) => ({ kind: "sooid", value }),
  ref: (oid) => ({ kind: "ref", oid }),
  /**
   * @deprecated Use `Arg.collection(oids.map((oid) => buildArgs([Arg.ref(oid)])))`
   * to make the element encoding explicit.
   */
  refList: (oids) => ({ kind: "refList", oids }),
  /** Length-prefixed collection of pre-serialized elements (IEnumerable<T> of structs). */
  collection: (elements) => ({ kind: "collection", elements }),
  enum_: (value) => ({ kind: "enum", value }),
  str: (value) => ({ kind: "str", value }),
  bool: (value) => ({ kind: "bool", value }),
  int: (value) => ({ kind: "int", value }),
  long: (value) => ({ kind: "long", value }),
  double: (value) => ({ kind: "double", value }),
  bytes: (value) => ({ kind: "bytes", value })
};
function buildArgs(args) {
  const w = new BinaryWriter();
  for (const a of args) writeArg(w, a);
  return w.toBuffer();
}
function inlineStruct(typeId, fields = []) {
  const fw = new BinaryWriter();
  for (const f of fields) fw.flexInt(f.index).bytes(f.value);
  fw.flexInt(0);
  const body = fw.toBuffer();
  return new BinaryWriter().long(1).flexInt(typeId).flexInt(body.length).bytes(body).toBuffer();
}
function writeArg(w, a) {
  switch (a.kind) {
    case "sooid":
      w.sooid(a.value);
      break;
    case "ref":
      w.long(a.oid);
      break;
    case "refList": {
      const inner = new BinaryWriter().flexInt(a.oids.length);
      for (const oid of a.oids) inner.long(oid);
      const body = inner.toBuffer();
      w.flexInt(body.length).bytes(body);
      break;
    }
    case "collection": {
      const inner = new BinaryWriter().flexInt(a.elements.length);
      for (const e of a.elements) inner.bytes(e);
      const body = inner.toBuffer();
      w.flexInt(body.length).bytes(body);
      break;
    }
    case "enum":
      w.flexInt(a.value);
      break;
    case "str":
      w.string(a.value);
      break;
    case "bool":
      w.boolean(a.value);
      break;
    case "int":
      w.integer(a.value);
      break;
    case "long":
      w.long(a.value);
      break;
    case "double":
      w.double(a.value);
      break;
    case "bytes":
      w.byteArray(a.value);
      break;
  }
}

// ../deep-roon-mcp/src/intern/generated/struct-schemas.ts
var schemas = {
  "Sooloos.Broker.Api.AppType": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.AppType::Name", "propType": 20 }, { "shortName": "IsSyncClient", "name": "bool Sooloos.Broker.Api.AppType::IsSyncClient", "propType": 2 }, { "shortName": "SupportsSyncClients", "name": "bool Sooloos.Broker.Api.AppType::SupportsSyncClients", "propType": 2 }, { "shortName": "SupportsRemoteControl", "name": "bool Sooloos.Broker.Api.AppType::SupportsRemoteControl", "propType": 2 }, { "shortName": "ControlsOthers", "name": "bool Sooloos.Broker.Api.AppType::ControlsOthers", "propType": 2 }, { "shortName": "LibrarySupported", "name": "bool Sooloos.Broker.Api.AppType::LibrarySupported", "propType": 2 }, { "shortName": "SharesZones", "name": "bool Sooloos.Broker.Api.AppType::SharesZones", "propType": 2 }, { "shortName": "IsDiscoverable", "name": "bool Sooloos.Broker.Api.AppType::IsDiscoverable", "propType": 2 }, { "shortName": "DiscoversOthers", "name": "bool Sooloos.Broker.Api.AppType::DiscoversOthers", "propType": 2 }],
  "Sooloos.Broker.Api.PerformerLink": [{ "shortName": "PerformerId", "name": "long Sooloos.Broker.Api.PerformerLink::PerformerId", "propType": 1 }, { "shortName": "Broker", "name": "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.PerformerLink::Broker", "propType": 23 }, { "shortName": "Source", "name": "Sooloos.Broker.Api.MediaSource Sooloos.Broker.Api.PerformerLink::Source", "propType": 9 }],
  "Sooloos.Broker.Api.PlaylistLink": [{ "shortName": "PlaylistId", "name": "System.Sooid Sooloos.Broker.Api.PlaylistLink::PlaylistId", "propType": 4 }, { "shortName": "Broker", "name": "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.PlaylistLink::Broker", "propType": 23 }, { "shortName": "Source", "name": "Sooloos.Broker.Api.MediaSource Sooloos.Broker.Api.PlaylistLink::Source", "propType": 9 }],
  "Sooloos.Broker.Api.MixLink": [{ "shortName": "MixId", "name": "System.Sooid Sooloos.Broker.Api.MixLink::MixId", "propType": 4 }, { "shortName": "Broker", "name": "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.MixLink::Broker", "propType": 23 }, { "shortName": "Source", "name": "Sooloos.Broker.Api.MediaSource Sooloos.Broker.Api.MixLink::Source", "propType": 9 }],
  "Sooloos.Broker.Api.TagLink": [{ "shortName": "TagId", "name": "System.Sooid Sooloos.Broker.Api.TagLink::TagId", "propType": 4 }, { "shortName": "Broker", "name": "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.TagLink::Broker", "propType": 23 }, { "shortName": "Source", "name": "Sooloos.Broker.Api.MediaSource Sooloos.Broker.Api.TagLink::Source", "propType": 9 }],
  "Sooloos.Broker.Api.HistoryPlayLink": [{ "shortName": "BrokerId", "name": "System.Guid Sooloos.Broker.Api.HistoryPlayLink::BrokerId", "propType": 3 }, { "shortName": "HistoryPlayId", "name": "long Sooloos.Broker.Api.HistoryPlayLink::HistoryPlayId", "propType": 1 }, { "shortName": "Broker", "name": "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.HistoryPlayLink::Broker", "propType": 23 }, { "shortName": "TrackBase", "name": "Sooloos.Broker.Api.TrackBase Sooloos.Broker.Api.HistoryPlayLink::TrackBase", "propType": 23 }],
  "Sooloos.Broker.Api.TrackLink": [{ "shortName": "TrackId", "name": "long Sooloos.Broker.Api.TrackLink::TrackId", "propType": 1 }, { "shortName": "Broker", "name": "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.TrackLink::Broker", "propType": 23 }, { "shortName": "Source", "name": "Sooloos.Broker.Api.MediaSource Sooloos.Broker.Api.TrackLink::Source", "propType": 9 }],
  "Sooloos.Broker.Api.PlaylistItemLink": [{ "shortName": "PlaylistItemId", "name": "long Sooloos.Broker.Api.PlaylistItemLink::PlaylistItemId", "propType": 1 }, { "shortName": "Track", "name": "Sooloos.Broker.Api.TrackBase Sooloos.Broker.Api.PlaylistItemLink::Track", "propType": 23 }, { "shortName": "Playlist", "name": "Sooloos.Broker.Api.Playlist Sooloos.Broker.Api.PlaylistItemLink::Playlist", "propType": 23 }],
  "Sooloos.Broker.Api.WorkLink": [{ "shortName": "WorkId", "name": "long Sooloos.Broker.Api.WorkLink::WorkId", "propType": 1 }, { "shortName": "Broker", "name": "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.WorkLink::Broker", "propType": 23 }, { "shortName": "Source", "name": "Sooloos.Broker.Api.MediaSource Sooloos.Broker.Api.WorkLink::Source", "propType": 9 }],
  "Sooloos.Broker.Api.AlbumLink": [{ "shortName": "AlbumId", "name": "long Sooloos.Broker.Api.AlbumLink::AlbumId", "propType": 1 }, { "shortName": "Broker", "name": "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.AlbumLink::Broker", "propType": 23 }, { "shortName": "Source", "name": "Sooloos.Broker.Api.MediaSource Sooloos.Broker.Api.AlbumLink::Source", "propType": 9 }],
  "Sooloos.Broker.Api.RoonApiSettingsButtonPressResult": [{ "shortName": "IsSuccess", "name": "bool Sooloos.Broker.Api.RoonApiSettingsButtonPressResult::IsSuccess", "propType": 2 }, { "shortName": "SettingsJson", "name": "string Sooloos.Broker.Api.RoonApiSettingsButtonPressResult::SettingsJson", "propType": 20 }, { "shortName": "Errors", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.RoonApiSettingsButtonPressResult::Errors", "propType": 23 }, { "shortName": "Message", "name": "string Sooloos.Broker.Api.RoonApiSettingsButtonPressResult::Message", "propType": 20 }],
  "Sooloos.Broker.Api.RoonApiSettingsSaveResult": [{ "shortName": "IsSuccess", "name": "bool Sooloos.Broker.Api.RoonApiSettingsSaveResult::IsSuccess", "propType": 2 }, { "shortName": "SettingsJson", "name": "string Sooloos.Broker.Api.RoonApiSettingsSaveResult::SettingsJson", "propType": 20 }, { "shortName": "Errors", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.RoonApiSettingsSaveResult::Errors", "propType": 23 }],
  "Sooloos.Broker.Api.Alert": [{ "shortName": "AlertId", "name": "System.Sooid Sooloos.Broker.Api.Alert::AlertId", "propType": 4 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.AlertType Sooloos.Broker.Api.Alert::Type", "propType": 9 }, { "shortName": "Sender", "name": "string Sooloos.Broker.Api.Alert::Sender", "propType": 20 }, { "shortName": "Name", "name": "string Sooloos.Broker.Api.Alert::Name", "propType": 20 }, { "shortName": "ZoneId", "name": "System.Sooid? Sooloos.Broker.Api.Alert::ZoneId", "propType": 14 }, { "shortName": "WaitUntilIdle", "name": "bool Sooloos.Broker.Api.Alert::WaitUntilIdle", "propType": 2 }, { "shortName": "TextKey", "name": "string Sooloos.Broker.Api.Alert::TextKey", "propType": 20 }, { "shortName": "TextParameters", "name": "System.Collections.Generic.IDictionary<string, string> Sooloos.Broker.Api.Alert::TextParameters", "propType": 23 }],
  "Sooloos.Broker.Api.Version": [{ "shortName": "MachineValue", "name": "int Sooloos.Broker.Api.Version::MachineValue", "propType": 0 }, { "shortName": "Branch", "name": "string Sooloos.Broker.Api.Version::Branch", "propType": 20 }, { "shortName": "DisplayValue", "name": "string Sooloos.Broker.Api.Version::DisplayValue", "propType": 20 }],
  "Sooloos.Broker.Api.MessageTemplate": [{ "shortName": "Key", "name": "string Sooloos.Broker.Api.MessageTemplate::Key", "propType": 20 }, { "shortName": "TemplateJson", "name": "string Sooloos.Broker.Api.MessageTemplate::TemplateJson", "propType": 20 }],
  "Sooloos.Broker.Api.Rule": [{ "shortName": "Op", "name": "string Sooloos.Broker.Api.Rule::Op", "propType": 20 }, { "shortName": "Field", "name": "string Sooloos.Broker.Api.Rule::Field", "propType": 20 }, { "shortName": "Value", "name": "string Sooloos.Broker.Api.Rule::Value", "propType": 20 }, { "shortName": "Rules", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Rule> Sooloos.Broker.Api.Rule::Rules", "propType": 23 }],
  "Sooloos.Broker.Api.ITunesStorageConfig": [{ "shortName": "Path", "name": "string Sooloos.Broker.Api.ITunesStorageConfig::Path", "propType": 20 }],
  "Sooloos.Broker.Api.StorageEdit": [{ "shortName": "LocationId", "name": "System.Guid Sooloos.Broker.Api.StorageEdit::LocationId", "propType": 3 }, { "shortName": "Location", "name": "Sooloos.Broker.Api.FileSystemEntry Sooloos.Broker.Api.StorageEdit::Location", "propType": 23 }, { "shortName": "IgnorePatterns", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.StorageEdit::IgnorePatterns", "propType": 23 }, { "shortName": "IgnoreItunes", "name": "bool? Sooloos.Broker.Api.StorageEdit::IgnoreItunes", "propType": 12 }, { "shortName": "IgnorePlaylists", "name": "bool? Sooloos.Broker.Api.StorageEdit::IgnorePlaylists", "propType": 12 }, { "shortName": "RescanDelay", "name": "int? Sooloos.Broker.Api.StorageEdit::RescanDelay", "propType": 10 }, { "shortName": "RespectBgWorkSchedule", "name": "bool? Sooloos.Broker.Api.StorageEdit::RespectBgWorkSchedule", "propType": 12 }],
  "Sooloos.Broker.Api.StorageCreate": [{ "shortName": "Location", "name": "Sooloos.Broker.Api.FileSystemEntry Sooloos.Broker.Api.StorageCreate::Location", "propType": 23 }, { "shortName": "IgnorePatterns", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.StorageCreate::IgnorePatterns", "propType": 23 }, { "shortName": "IgnoreItunes", "name": "bool Sooloos.Broker.Api.StorageCreate::IgnoreItunes", "propType": 2 }, { "shortName": "IgnorePlaylists", "name": "bool Sooloos.Broker.Api.StorageCreate::IgnorePlaylists", "propType": 2 }, { "shortName": "RescanDelay", "name": "int Sooloos.Broker.Api.StorageCreate::RescanDelay", "propType": 0 }, { "shortName": "RespectBgWorkSchedule", "name": "bool Sooloos.Broker.Api.StorageCreate::RespectBgWorkSchedule", "propType": 2 }],
  "Sooloos.Broker.Api.BumpMachine": [{ "shortName": "MachineName", "name": "string Sooloos.Broker.Api.BumpMachine::MachineName", "propType": 20 }, { "shortName": "MachineId", "name": "string Sooloos.Broker.Api.BumpMachine::MachineId", "propType": 20 }],
  "Sooloos.Broker.Api.LicenseExpiringSoon": [{ "shortName": "LicenseId", "name": "string Sooloos.Broker.Api.LicenseExpiringSoon::LicenseId", "propType": 20 }, { "shortName": "Type", "name": "string Sooloos.Broker.Api.LicenseExpiringSoon::Type", "propType": 20 }, { "shortName": "Expiration", "name": "System.DateTime Sooloos.Broker.Api.LicenseExpiringSoon::Expiration", "propType": 8 }],
  "Sooloos.Broker.Api.Nag": [{ "shortName": "Severity", "name": "string Sooloos.Broker.Api.Nag::Severity", "propType": 20 }, { "shortName": "AlertText", "name": "System.Collections.Generic.IDictionary<string, string> Sooloos.Broker.Api.Nag::AlertText", "propType": 23 }, { "shortName": "PopupTitle", "name": "System.Collections.Generic.IDictionary<string, string> Sooloos.Broker.Api.Nag::PopupTitle", "propType": 23 }, { "shortName": "PopupBody", "name": "System.Collections.Generic.IDictionary<string, string> Sooloos.Broker.Api.Nag::PopupBody", "propType": 23 }, { "shortName": "ButtonText", "name": "System.Collections.Generic.IDictionary<string, string> Sooloos.Broker.Api.Nag::ButtonText", "propType": 23 }, { "shortName": "Url", "name": "string Sooloos.Broker.Api.Nag::Url", "propType": 20 }],
  "Sooloos.Broker.Api.ProfileCreate": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.ProfileCreate::Name", "propType": 20 }, { "shortName": "BirthDate", "name": "string Sooloos.Broker.Api.ProfileCreate::BirthDate", "propType": 20 }, { "shortName": "Image", "name": "System.Byte[] Sooloos.Broker.Api.ProfileCreate::Image", "propType": 21 }, { "shortName": "ScrobblerToken", "name": "string Sooloos.Broker.Api.ProfileCreate::ScrobblerToken", "propType": 20 }, { "shortName": "ListenBrainzToken", "name": "string Sooloos.Broker.Api.ProfileCreate::ListenBrainzToken", "propType": 20 }, { "shortName": "FacebookAuth", "name": "string Sooloos.Broker.Api.ProfileCreate::FacebookAuth", "propType": 20 }, { "shortName": "TwitterAuth", "name": "string Sooloos.Broker.Api.ProfileCreate::TwitterAuth", "propType": 20 }],
  "Sooloos.Broker.Api.ProfileEdit": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.ProfileEdit::Name", "propType": 20 }, { "shortName": "RemoveImage", "name": "bool Sooloos.Broker.Api.ProfileEdit::RemoveImage", "propType": 2 }, { "shortName": "Image", "name": "System.Byte[] Sooloos.Broker.Api.ProfileEdit::Image", "propType": 21 }, { "shortName": "RemoveBirthDate", "name": "bool Sooloos.Broker.Api.ProfileEdit::RemoveBirthDate", "propType": 2 }, { "shortName": "BirthDate", "name": "string Sooloos.Broker.Api.ProfileEdit::BirthDate", "propType": 20 }, { "shortName": "ScrobblerToken", "name": "string Sooloos.Broker.Api.ProfileEdit::ScrobblerToken", "propType": 20 }, { "shortName": "ListenBrainzToken", "name": "string Sooloos.Broker.Api.ProfileEdit::ListenBrainzToken", "propType": 20 }, { "shortName": "FacebookAuth", "name": "string Sooloos.Broker.Api.ProfileEdit::FacebookAuth", "propType": 20 }, { "shortName": "TwitterAuth", "name": "string Sooloos.Broker.Api.ProfileEdit::TwitterAuth", "propType": 20 }],
  "Sooloos.Broker.Api.AccountEdit": [{ "shortName": "FirstName", "name": "string Sooloos.Broker.Api.AccountEdit::FirstName", "propType": 20 }, { "shortName": "LastName", "name": "string Sooloos.Broker.Api.AccountEdit::LastName", "propType": 20 }, { "shortName": "Email", "name": "string Sooloos.Broker.Api.AccountEdit::Email", "propType": 20 }, { "shortName": "JoinMailingList", "name": "bool? Sooloos.Broker.Api.AccountEdit::JoinMailingList", "propType": 12 }],
  "Sooloos.Broker.Api.VirtualQueryParameters": [{ "shortName": "PageSize", "name": "int Sooloos.Broker.Api.VirtualQueryParameters::PageSize", "propType": 0 }, { "shortName": "CopySelectionState", "name": "object Sooloos.Broker.Api.VirtualQueryParameters::CopySelectionState", "propType": 23 }],
  "Sooloos.Broker.Api.VirtualQuerySection": [{ "shortName": "Label", "name": "string Sooloos.Broker.Api.VirtualQuerySection::Label", "propType": 20 }, { "shortName": "ShortLabel", "name": "string Sooloos.Broker.Api.VirtualQuerySection::ShortLabel", "propType": 20 }, { "shortName": "ItemCount", "name": "int Sooloos.Broker.Api.VirtualQuerySection::ItemCount", "propType": 0 }],
  "Sooloos.Broker.Api.VendorCriteria": [{ "shortName": "AutodetectDevice", "name": "Sooloos.Broker.Api.AudioDevice Sooloos.Broker.Api.VendorCriteria::AutodetectDevice", "propType": 23 }, { "shortName": "AutodetectBridgedDevice", "name": "Sooloos.Broker.Api.AudioDevice Sooloos.Broker.Api.VendorCriteria::AutodetectBridgedDevice", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.VendorCriteria::TextFilter", "propType": 20 }],
  "Sooloos.Broker.Api.ProductCriteria": [{ "shortName": "AutodetectDevice", "name": "Sooloos.Broker.Api.AudioDevice Sooloos.Broker.Api.ProductCriteria::AutodetectDevice", "propType": 23 }, { "shortName": "AutodetectBridgedDevice", "name": "Sooloos.Broker.Api.AudioDevice Sooloos.Broker.Api.ProductCriteria::AutodetectBridgedDevice", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.ProductCriteria::TextFilter", "propType": 20 }, { "shortName": "RequireVendors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Vendor> Sooloos.Broker.Api.ProductCriteria::RequireVendors", "propType": 23 }, { "shortName": "ExcludeVendors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Vendor> Sooloos.Broker.Api.ProductCriteria::ExcludeVendors", "propType": 23 }],
  "Sooloos.Broker.Api.PlayFeedback": [{ "shortName": "Action", "name": "Sooloos.Broker.Api.PlayAction Sooloos.Broker.Api.PlayFeedback::Action", "propType": 9 }, { "shortName": "ItemCount", "name": "int Sooloos.Broker.Api.PlayFeedback::ItemCount", "propType": 0 }, { "shortName": "DidLimitItemCount", "name": "bool Sooloos.Broker.Api.PlayFeedback::DidLimitItemCount", "propType": 2 }, { "shortName": "ItemCountLimit", "name": "int Sooloos.Broker.Api.PlayFeedback::ItemCountLimit", "propType": 0 }],
  "Sooloos.Broker.Api.SwimParameters": [{ "shortName": "BrokerId", "name": "System.Guid Sooloos.Broker.Api.SwimParameters::BrokerId", "propType": 3 }, { "shortName": "Priority", "name": "Sooloos.Broker.Api.SwimPriority Sooloos.Broker.Api.SwimParameters::Priority", "propType": 9 }, { "shortName": "Tracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackBase> Sooloos.Broker.Api.SwimParameters::Tracks", "propType": 23 }, { "shortName": "Albums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumBase> Sooloos.Broker.Api.SwimParameters::Albums", "propType": 23 }, { "shortName": "Composers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.SwimParameters::Composers", "propType": 23 }, { "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.SwimParameters::Performers", "propType": 23 }, { "shortName": "Genres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimParameters::Genres", "propType": 23 }, { "shortName": "Labels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimParameters::Labels", "propType": 23 }, { "shortName": "Tags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagBase> Sooloos.Broker.Api.SwimParameters::Tags", "propType": 23 }, { "shortName": "Playlists", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PlaylistBase> Sooloos.Broker.Api.SwimParameters::Playlists", "propType": 23 }, { "shortName": "Mixes", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.MixBase> Sooloos.Broker.Api.SwimParameters::Mixes", "propType": 23 }, { "shortName": "Works", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkBase> Sooloos.Broker.Api.SwimParameters::Works", "propType": 23 }, { "shortName": "Performances", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformanceBase> Sooloos.Broker.Api.SwimParameters::Performances", "propType": 23 }, { "shortName": "Sooids", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.SwimParameters::Sooids", "propType": 23 }, { "shortName": "LimitToSeed", "name": "bool Sooloos.Broker.Api.SwimParameters::LimitToSeed", "propType": 2 }, { "shortName": "LimitToLibrary", "name": "bool Sooloos.Broker.Api.SwimParameters::LimitToLibrary", "propType": 2 }, { "shortName": "PreplayTrackFromSeed", "name": "bool Sooloos.Broker.Api.SwimParameters::PreplayTrackFromSeed", "propType": 2 }, { "shortName": "AlbumCriteria", "name": "Sooloos.Broker.Api.AlbumQueryCriteria Sooloos.Broker.Api.SwimParameters::AlbumCriteria", "propType": 23 }, { "shortName": "PerformerCriteria", "name": "Sooloos.Broker.Api.PerformerQueryCriteria Sooloos.Broker.Api.SwimParameters::PerformerCriteria", "propType": 23 }, { "shortName": "ComposerCriteria", "name": "Sooloos.Broker.Api.PerformerQueryCriteria Sooloos.Broker.Api.SwimParameters::ComposerCriteria", "propType": 23 }, { "shortName": "WorkCriteria", "name": "Sooloos.Broker.Api.WorkQueryCriteria Sooloos.Broker.Api.SwimParameters::WorkCriteria", "propType": 23 }, { "shortName": "TrackCriteria", "name": "Sooloos.Broker.Api.TrackQueryCriteria Sooloos.Broker.Api.SwimParameters::TrackCriteria", "propType": 23 }, { "shortName": "UseLocalGenres", "name": "bool? Sooloos.Broker.Api.SwimParameters::UseLocalGenres", "propType": 12 }, { "shortName": "UseMetadataGenres", "name": "bool? Sooloos.Broker.Api.SwimParameters::UseMetadataGenres", "propType": 12 }, { "shortName": "IncludeHidden", "name": "bool? Sooloos.Broker.Api.SwimParameters::IncludeHidden", "propType": 12 }],
  "Sooloos.Broker.Api.SwimDescription": [{ "shortName": "LimitToSeed", "name": "bool Sooloos.Broker.Api.SwimDescription::LimitToSeed", "propType": 2 }, { "shortName": "IsPlayArtist", "name": "bool Sooloos.Broker.Api.SwimDescription::IsPlayArtist", "propType": 2 }, { "shortName": "Genres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimDescription::Genres", "propType": 23 }, { "shortName": "Labels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimDescription::Labels", "propType": 23 }, { "shortName": "Tags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SwimTagDescription> Sooloos.Broker.Api.SwimDescription::Tags", "propType": 23 }, { "shortName": "Playlists", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimDescription::Playlists", "propType": 23 }, { "shortName": "Composers", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimDescription::Composers", "propType": 23 }, { "shortName": "Performers", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimDescription::Performers", "propType": 23 }, { "shortName": "Tracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SwimTrackDescription> Sooloos.Broker.Api.SwimDescription::Tracks", "propType": 23 }, { "shortName": "Albums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SwimAlbumDescription> Sooloos.Broker.Api.SwimDescription::Albums", "propType": 23 }, { "shortName": "Works", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SwimWorkDescription> Sooloos.Broker.Api.SwimDescription::Works", "propType": 23 }, { "shortName": "Performances", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SwimPerformanceDescription> Sooloos.Broker.Api.SwimDescription::Performances", "propType": 23 }, { "shortName": "AlbumCriteria", "name": "System.Byte[] Sooloos.Broker.Api.SwimDescription::AlbumCriteria", "propType": 21 }, { "shortName": "TrackCriteria", "name": "System.Byte[] Sooloos.Broker.Api.SwimDescription::TrackCriteria", "propType": 21 }, { "shortName": "PerformerCriteria", "name": "System.Byte[] Sooloos.Broker.Api.SwimDescription::PerformerCriteria", "propType": 21 }, { "shortName": "ComposerCriteria", "name": "System.Byte[] Sooloos.Broker.Api.SwimDescription::ComposerCriteria", "propType": 21 }, { "shortName": "WorkCriteria", "name": "System.Byte[] Sooloos.Broker.Api.SwimDescription::WorkCriteria", "propType": 21 }],
  "Sooloos.Broker.Api.SwimTagDescription": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.SwimTagDescription::Name", "propType": 20 }, { "shortName": "TagId", "name": "System.Sooid Sooloos.Broker.Api.SwimTagDescription::TagId", "propType": 4 }],
  "Sooloos.Broker.Api.SwimTrackDescription": [{ "shortName": "Title", "name": "string Sooloos.Broker.Api.SwimTrackDescription::Title", "propType": 20 }, { "shortName": "Album", "name": "Sooloos.Broker.Api.SwimAlbumDescription Sooloos.Broker.Api.SwimTrackDescription::Album", "propType": 23 }, { "shortName": "MainPerformers", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimTrackDescription::MainPerformers", "propType": 23 }],
  "Sooloos.Broker.Api.SwimAlbumDescription": [{ "shortName": "Title", "name": "string Sooloos.Broker.Api.SwimAlbumDescription::Title", "propType": 20 }, { "shortName": "PerformedBy", "name": "string Sooloos.Broker.Api.SwimAlbumDescription::PerformedBy", "propType": 20 }, { "shortName": "MainPerformers", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimAlbumDescription::MainPerformers", "propType": 23 }],
  "Sooloos.Broker.Api.SwimWorkDescription": [{ "shortName": "Title", "name": "string Sooloos.Broker.Api.SwimWorkDescription::Title", "propType": 20 }, { "shortName": "Composers", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimWorkDescription::Composers", "propType": 23 }],
  "Sooloos.Broker.Api.SwimPerformanceDescription": [{ "shortName": "Work", "name": "Sooloos.Broker.Api.SwimWorkDescription Sooloos.Broker.Api.SwimPerformanceDescription::Work", "propType": 23 }, { "shortName": "MainPerformers", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SwimPerformanceDescription::MainPerformers", "propType": 23 }],
  "Sooloos.Broker.Api.PlayParameters": [{ "shortName": "Priority", "name": "Sooloos.Broker.Api.PlayPriority Sooloos.Broker.Api.PlayParameters::Priority", "propType": 9 }, { "shortName": "Shuffle", "name": "bool Sooloos.Broker.Api.PlayParameters::Shuffle", "propType": 2 }, { "shortName": "IsFromHere", "name": "bool Sooloos.Broker.Api.PlayParameters::IsFromHere", "propType": 2 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PlayParameters::LanguagePreferences", "propType": 23 }, { "shortName": "ClickSource", "name": "string Sooloos.Broker.Api.PlayParameters::ClickSource", "propType": 20 }],
  "Sooloos.Broker.Api.PlaySooidOptionalParameters": [{ "shortName": "AlbumFavoritesOnly", "name": "bool Sooloos.Broker.Api.PlaySooidOptionalParameters::AlbumFavoritesOnly", "propType": 2 }, { "shortName": "PerformancesIncludeAll", "name": "bool Sooloos.Broker.Api.PlaySooidOptionalParameters::PerformancesIncludeAll", "propType": 2 }, { "shortName": "FromPlaylistItem", "name": "Sooloos.Broker.Api.PlaylistItem Sooloos.Broker.Api.PlaySooidOptionalParameters::FromPlaylistItem", "propType": 23 }, { "shortName": "MixFromIndex", "name": "int Sooloos.Broker.Api.PlaySooidOptionalParameters::MixFromIndex", "propType": 0 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.PlaySooidOptionalParameters::IncludeHidden", "propType": 2 }],
  "Sooloos.Broker.Api.ChannelNowPlaying": [{ "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.ChannelNowPlaying::Image", "propType": 23 }, { "shortName": "LengthSeconds", "name": "int? Sooloos.Broker.Api.ChannelNowPlaying::LengthSeconds", "propType": 10 }, { "shortName": "Title", "name": "string Sooloos.Broker.Api.ChannelNowPlaying::Title", "propType": 20 }, { "shortName": "Subtitle", "name": "string Sooloos.Broker.Api.ChannelNowPlaying::Subtitle", "propType": 20 }, { "shortName": "MainPerformerName", "name": "string Sooloos.Broker.Api.ChannelNowPlaying::MainPerformerName", "propType": 20 }, { "shortName": "AlbumTitle", "name": "string Sooloos.Broker.Api.ChannelNowPlaying::AlbumTitle", "propType": 20 }, { "shortName": "TrackTitle", "name": "string Sooloos.Broker.Api.ChannelNowPlaying::TrackTitle", "propType": 20 }, { "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.ChannelNowPlaying::Track", "propType": 23 }],
  "Sooloos.Broker.Api.AutomaticBackupDestinationEditConfig": [{ "shortName": "SecondsAfterMidnightUtc", "name": "int? Sooloos.Broker.Api.AutomaticBackupDestinationEditConfig::SecondsAfterMidnightUtc", "propType": 10 }, { "shortName": "SecondsBetweenBackups", "name": "int? Sooloos.Broker.Api.AutomaticBackupDestinationEditConfig::SecondsBetweenBackups", "propType": 10 }, { "shortName": "NumberOfBackupsKept", "name": "int? Sooloos.Broker.Api.AutomaticBackupDestinationEditConfig::NumberOfBackupsKept", "propType": 10 }, { "shortName": "HasLocation", "name": "bool Sooloos.Broker.Api.AutomaticBackupDestinationEditConfig::HasLocation", "propType": 2 }, { "shortName": "Location", "name": "Sooloos.Broker.Api.FileSystemEntry Sooloos.Broker.Api.AutomaticBackupDestinationEditConfig::Location", "propType": 23 }],
  "Sooloos.Broker.Api.AutomaticBackupDestinationConfig": [{ "shortName": "SecondsAfterMidnightUtc", "name": "int Sooloos.Broker.Api.AutomaticBackupDestinationConfig::SecondsAfterMidnightUtc", "propType": 0 }, { "shortName": "SecondsBetweenBackups", "name": "int Sooloos.Broker.Api.AutomaticBackupDestinationConfig::SecondsBetweenBackups", "propType": 0 }, { "shortName": "NumberOfBackupsKept", "name": "int Sooloos.Broker.Api.AutomaticBackupDestinationConfig::NumberOfBackupsKept", "propType": 0 }, { "shortName": "Location", "name": "Sooloos.Broker.Api.FileSystemEntry Sooloos.Broker.Api.AutomaticBackupDestinationConfig::Location", "propType": 23 }],
  "Sooloos.Broker.Api.RestoreItem": [{ "shortName": "MachineName", "name": "string Sooloos.Broker.Api.RestoreItem::MachineName", "propType": 20 }, { "shortName": "MachineId", "name": "string Sooloos.Broker.Api.RestoreItem::MachineId", "propType": 20 }, { "shortName": "BackupName", "name": "string Sooloos.Broker.Api.RestoreItem::BackupName", "propType": 20 }, { "shortName": "Date", "name": "System.DateTime Sooloos.Broker.Api.RestoreItem::Date", "propType": 8 }, { "shortName": "DateUtc", "name": "System.DateTime Sooloos.Broker.Api.RestoreItem::DateUtc", "propType": 8 }, { "shortName": "Description", "name": "string Sooloos.Broker.Api.RestoreItem::Description", "propType": 20 }],
  "Sooloos.Broker.Api.RadioBrowseCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.RadioBrowseOrdering Sooloos.Broker.Api.RadioBrowseCriteria::Ordering", "propType": 9 }, { "shortName": "RequireIsExplicit", "name": "bool Sooloos.Broker.Api.RadioBrowseCriteria::RequireIsExplicit", "propType": 2 }, { "shortName": "ExcludeIsExplicit", "name": "bool Sooloos.Broker.Api.RadioBrowseCriteria::ExcludeIsExplicit", "propType": 2 }, { "shortName": "RequireHasAdvertising", "name": "bool Sooloos.Broker.Api.RadioBrowseCriteria::RequireHasAdvertising", "propType": 2 }, { "shortName": "ExcludeHasAdvertising", "name": "bool Sooloos.Broker.Api.RadioBrowseCriteria::ExcludeHasAdvertising", "propType": 2 }, { "shortName": "RequireLanguages", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.RadioBrowseCriteria::RequireLanguages", "propType": 23 }, { "shortName": "MaxDistance", "name": "int? Sooloos.Broker.Api.RadioBrowseCriteria::MaxDistance", "propType": 10 }, { "shortName": "Category", "name": "Sooloos.Broker.Api.RadioCategory Sooloos.Broker.Api.RadioBrowseCriteria::Category", "propType": 23 }, { "shortName": "Genre", "name": "string Sooloos.Broker.Api.RadioBrowseCriteria::Genre", "propType": 20 }],
  "Sooloos.Broker.Api.ChannelQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.ChannelOrdering Sooloos.Broker.Api.ChannelQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.ChannelQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.ChannelQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.ChannelQueryOrdering Sooloos.Broker.Api.ChannelQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.ChannelQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "RequireIsPlayed", "name": "bool Sooloos.Broker.Api.ChannelQueryCriteria::RequireIsPlayed", "propType": 2 }, { "shortName": "RequireInLibrary", "name": "bool Sooloos.Broker.Api.ChannelQueryCriteria::RequireInLibrary", "propType": 2 }],
  "Sooloos.Broker.Api.ChannelData": [{ "shortName": "ChannelId", "name": "System.Sooid Sooloos.Broker.Api.ChannelData::ChannelId", "propType": 4 }, { "shortName": "Name", "name": "string Sooloos.Broker.Api.ChannelData::Name", "propType": 20 }, { "shortName": "ImportDate", "name": "System.DateTime? Sooloos.Broker.Api.ChannelData::ImportDate", "propType": 18 }, { "shortName": "Description", "name": "string Sooloos.Broker.Api.ChannelData::Description", "propType": 20 }, { "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.ChannelData::Image", "propType": 23 }, { "shortName": "Website", "name": "string Sooloos.Broker.Api.ChannelData::Website", "propType": 20 }, { "shortName": "Languages", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.ChannelData::Languages", "propType": 23 }, { "shortName": "Location", "name": "string Sooloos.Broker.Api.ChannelData::Location", "propType": 20 }, { "shortName": "Frequency", "name": "string Sooloos.Broker.Api.ChannelData::Frequency", "propType": 20 }, { "shortName": "Band", "name": "string Sooloos.Broker.Api.ChannelData::Band", "propType": 20 }, { "shortName": "MediaUrls", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.ChannelData::MediaUrls", "propType": 23 }, { "shortName": "SourceIds", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.ChannelData::SourceIds", "propType": 23 }],
  "Sooloos.Broker.Api.BeginSetupParameters": [{ "shortName": "AvoidDisruption", "name": "bool Sooloos.Broker.Api.BeginSetupParameters::AvoidDisruption", "propType": 2 }],
  "Sooloos.Broker.Api.RaatServerAudioDeviceConfigInfo": [{ "shortName": "DeviceInfo", "name": "string Sooloos.Broker.Api.RaatServerAudioDeviceConfigInfo::DeviceInfo", "propType": 20 }, { "shortName": "ConfigInfo", "name": "string Sooloos.Broker.Api.RaatServerAudioDeviceConfigInfo::ConfigInfo", "propType": 20 }, { "shortName": "Config", "name": "string Sooloos.Broker.Api.RaatServerAudioDeviceConfigInfo::Config", "propType": 20 }],
  "Sooloos.Broker.Api.AudioDeviceCommonConfigInfo": [{ "shortName": "SupportsExternalVolumeControl", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsExternalVolumeControl", "propType": 2 }, { "shortName": "ExternalVolumeControl", "name": "Sooloos.Broker.Api.ExternalVolumeControl Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::ExternalVolumeControl", "propType": 23 }, { "shortName": "SupportsExternalSourceControl", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsExternalSourceControl", "propType": 2 }, { "shortName": "ExternalSourceControls", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ExternalSourceControl> Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::ExternalSourceControls", "propType": 23 }, { "shortName": "SupportsOutputChannels", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsOutputChannels", "propType": 2 }, { "shortName": "SupportedOutputChannels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportedOutputChannels", "propType": 23 }, { "shortName": "OutputChannels", "name": "string Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::OutputChannels", "propType": 20 }, { "shortName": "SupportsSwapRearAndSurroundChannels", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsSwapRearAndSurroundChannels", "propType": 2 }, { "shortName": "SwapRearAndSurroundChannels", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SwapRearAndSurroundChannels", "propType": 2 }, { "shortName": "SupportsEnableStereoChannelMapping", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsEnableStereoChannelMapping", "propType": 2 }, { "shortName": "EnableStereoChannelMapping", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::EnableStereoChannelMapping", "propType": 2 }, { "shortName": "SupportsOutputMixing", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsOutputMixing", "propType": 2 }, { "shortName": "SupportedOutputMixing", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportedOutputMixing", "propType": 23 }, { "shortName": "OutputMixing", "name": "string Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::OutputMixing", "propType": 20 }, { "shortName": "SupportsMQACapabilities", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsMQACapabilities", "propType": 2 }, { "shortName": "MQACapabilities", "name": "string Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::MQACapabilities", "propType": 20 }, { "shortName": "SupportedMQACapabilities", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportedMQACapabilities", "propType": 23 }, { "shortName": "SupportsEnableMQACoreDecoder", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsEnableMQACoreDecoder", "propType": 2 }, { "shortName": "EnableMQACoreDecoder", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::EnableMQACoreDecoder", "propType": 2 }, { "shortName": "SupportsAutoSleepSeconds", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportsAutoSleepSeconds", "propType": 2 }, { "shortName": "SupportedAutoSleepSecondsValues", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::SupportedAutoSleepSecondsValues", "propType": 23 }, { "shortName": "AutoSleepSeconds", "name": "int? Sooloos.Broker.Api.AudioDeviceCommonConfigInfo::AutoSleepSeconds", "propType": 10 }],
  "Sooloos.Broker.Api.AudioDeviceCommonConfigEdit": [{ "shortName": "ClearExternalVolumeControl", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::ClearExternalVolumeControl", "propType": 2 }, { "shortName": "ExternalVolumeControl", "name": "Sooloos.Broker.Api.ExternalVolumeControl Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::ExternalVolumeControl", "propType": 23 }, { "shortName": "ClearExternalSourceControls", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::ClearExternalSourceControls", "propType": 2 }, { "shortName": "AddExternalSourceControls", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ExternalSourceControl> Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::AddExternalSourceControls", "propType": 23 }, { "shortName": "RemoveExternalSourceControls", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ExternalSourceControl> Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::RemoveExternalSourceControls", "propType": 23 }, { "shortName": "OutputChannels", "name": "string Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::OutputChannels", "propType": 20 }, { "shortName": "SwapRearAndSurroundChannels", "name": "bool? Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::SwapRearAndSurroundChannels", "propType": 12 }, { "shortName": "EnableStereoChannelMapping", "name": "bool? Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::EnableStereoChannelMapping", "propType": 12 }, { "shortName": "OutputMixing", "name": "string Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::OutputMixing", "propType": 20 }, { "shortName": "MQACapabilities", "name": "string Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::MQACapabilities", "propType": 20 }, { "shortName": "EnableMQACoreDecoder", "name": "bool? Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::EnableMQACoreDecoder", "propType": 12 }, { "shortName": "ClearAutoSleepSeconds", "name": "bool Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::ClearAutoSleepSeconds", "propType": 2 }, { "shortName": "AutoSleepSeconds", "name": "int? Sooloos.Broker.Api.AudioDeviceCommonConfigEdit::AutoSleepSeconds", "propType": 10 }],
  "Sooloos.Broker.Api.ConvolutionFilterParseResult": [{ "shortName": "IsSuccess", "name": "bool Sooloos.Broker.Api.ConvolutionFilterParseResult::IsSuccess", "propType": 2 }, { "shortName": "Errors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ConvolutionFilterParseError> Sooloos.Broker.Api.ConvolutionFilterParseResult::Errors", "propType": 23 }],
  "Sooloos.Broker.Api.ConvolutionFilterParseError": [{ "shortName": "FileName", "name": "string Sooloos.Broker.Api.ConvolutionFilterParseError::FileName", "propType": 20 }, { "shortName": "LineNumber", "name": "int? Sooloos.Broker.Api.ConvolutionFilterParseError::LineNumber", "propType": 10 }, { "shortName": "ErrorKey", "name": "string Sooloos.Broker.Api.ConvolutionFilterParseError::ErrorKey", "propType": 20 }, { "shortName": "Value", "name": "string Sooloos.Broker.Api.ConvolutionFilterParseError::Value", "propType": 20 }],
  "Sooloos.Broker.Api.ParametricEqualizerSpec": [{ "shortName": "YAxisMinDb", "name": "double? Sooloos.Broker.Api.ParametricEqualizerSpec::YAxisMinDb", "propType": 15 }, { "shortName": "YAxisMaxDb", "name": "double? Sooloos.Broker.Api.ParametricEqualizerSpec::YAxisMaxDb", "propType": 15 }, { "shortName": "GainDb", "name": "double Sooloos.Broker.Api.ParametricEqualizerSpec::GainDb", "propType": 5 }, { "shortName": "Bands", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ParametricEqualizerBand> Sooloos.Broker.Api.ParametricEqualizerSpec::Bands", "propType": 23 }],
  "Sooloos.Broker.Api.ParametricEqualizerBand": [{ "shortName": "Type", "name": "string Sooloos.Broker.Api.ParametricEqualizerBand::Type", "propType": 20 }, { "shortName": "Q", "name": "double? Sooloos.Broker.Api.ParametricEqualizerBand::Q", "propType": 15 }, { "shortName": "GainDb", "name": "double? Sooloos.Broker.Api.ParametricEqualizerBand::GainDb", "propType": 15 }, { "shortName": "Frequency", "name": "double? Sooloos.Broker.Api.ParametricEqualizerBand::Frequency", "propType": 15 }, { "shortName": "Order", "name": "int? Sooloos.Broker.Api.ParametricEqualizerBand::Order", "propType": 10 }, { "shortName": "IsEnabled", "name": "bool Sooloos.Broker.Api.ParametricEqualizerBand::IsEnabled", "propType": 2 }],
  "Sooloos.Broker.Api.DspChannel": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.DspChannel::Name", "propType": 20 }, { "shortName": "Channel", "name": "int Sooloos.Broker.Api.DspChannel::Channel", "propType": 0 }],
  "Sooloos.Broker.Api.PEQRemixRuleCreate": [{ "shortName": "InputChannel", "name": "Sooloos.Broker.Api.DspChannel Sooloos.Broker.Api.PEQRemixRuleCreate::InputChannel", "propType": 23 }, { "shortName": "OutputChannel", "name": "Sooloos.Broker.Api.DspChannel Sooloos.Broker.Api.PEQRemixRuleCreate::OutputChannel", "propType": 23 }, { "shortName": "GainDb", "name": "double Sooloos.Broker.Api.PEQRemixRuleCreate::GainDb", "propType": 5 }, { "shortName": "InvertPhase", "name": "bool Sooloos.Broker.Api.PEQRemixRuleCreate::InvertPhase", "propType": 2 }],
  "Sooloos.Broker.Api.TuneInBrowse": [{ "shortName": "Title", "name": "string Sooloos.Broker.Api.TuneInBrowse::Title", "propType": 20 }, { "shortName": "Items", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.TuneInOutline> Sooloos.Broker.Api.TuneInBrowse::Items", "propType": 23 }],
  "Sooloos.Broker.Api.TuneInOutline": [{ "shortName": "Type", "name": "Sooloos.Broker.Api.TuneInOutlineType Sooloos.Broker.Api.TuneInOutline::Type", "propType": 9 }, { "shortName": "Title", "name": "string Sooloos.Broker.Api.TuneInOutline::Title", "propType": 20 }, { "shortName": "Subtitle", "name": "string Sooloos.Broker.Api.TuneInOutline::Subtitle", "propType": 20 }, { "shortName": "Url", "name": "string Sooloos.Broker.Api.TuneInOutline::Url", "propType": 20 }, { "shortName": "ChannelId", "name": "System.Sooid? Sooloos.Broker.Api.TuneInOutline::ChannelId", "propType": 14 }, { "shortName": "ImageUrl", "name": "string Sooloos.Broker.Api.TuneInOutline::ImageUrl", "propType": 20 }, { "shortName": "Key", "name": "string Sooloos.Broker.Api.TuneInOutline::Key", "propType": 20 }, { "shortName": "Items", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.TuneInOutline> Sooloos.Broker.Api.TuneInOutline::Items", "propType": 23 }],
  "Sooloos.Broker.Api.TuneInCountry": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.TuneInCountry::Name", "propType": 20 }, { "shortName": "CountryId", "name": "string Sooloos.Broker.Api.TuneInCountry::CountryId", "propType": 20 }, { "shortName": "ISO", "name": "string Sooloos.Broker.Api.TuneInCountry::ISO", "propType": 20 }, { "shortName": "IsPostalCountry", "name": "bool Sooloos.Broker.Api.TuneInCountry::IsPostalCountry", "propType": 2 }],
  "Sooloos.Broker.Api.PersistentTrackId": [{ "shortName": "BrokerId", "name": "System.Guid? Sooloos.Broker.Api.PersistentTrackId::BrokerId", "propType": 13 }, { "shortName": "LibraryTrackId", "name": "System.Sooid? Sooloos.Broker.Api.PersistentTrackId::LibraryTrackId", "propType": 14 }, { "shortName": "ServiceTrackId", "name": "System.Sooid? Sooloos.Broker.Api.PersistentTrackId::ServiceTrackId", "propType": 14 }, { "shortName": "Signature", "name": "System.Byte[] Sooloos.Broker.Api.PersistentTrackId::Signature", "propType": 21 }, { "shortName": "ExternalTrackIds", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.PersistentTrackId::ExternalTrackIds", "propType": 23 }],
  "Sooloos.Broker.Api.PersistentAlbumId": [{ "shortName": "BrokerId", "name": "System.Guid? Sooloos.Broker.Api.PersistentAlbumId::BrokerId", "propType": 13 }, { "shortName": "LibraryAlbumId", "name": "System.Sooid? Sooloos.Broker.Api.PersistentAlbumId::LibraryAlbumId", "propType": 14 }, { "shortName": "ExternalAlbumIds", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.PersistentAlbumId::ExternalAlbumIds", "propType": 23 }],
  "Sooloos.Broker.Api.PersistentPerformerId": [{ "shortName": "BrokerId", "name": "System.Guid? Sooloos.Broker.Api.PersistentPerformerId::BrokerId", "propType": 13 }, { "shortName": "LibraryPerformerId", "name": "System.Sooid? Sooloos.Broker.Api.PersistentPerformerId::LibraryPerformerId", "propType": 14 }, { "shortName": "ExternalPerformerIds", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.PersistentPerformerId::ExternalPerformerIds", "propType": 23 }],
  "Sooloos.Broker.Api.PersistentWorkId": [{ "shortName": "BrokerId", "name": "System.Guid? Sooloos.Broker.Api.PersistentWorkId::BrokerId", "propType": 13 }, { "shortName": "LibraryWorkId", "name": "System.Sooid? Sooloos.Broker.Api.PersistentWorkId::LibraryWorkId", "propType": 14 }, { "shortName": "ExternalWorkIds", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.PersistentWorkId::ExternalWorkIds", "propType": 23 }],
  "Sooloos.Broker.Api.PersistentPerformanceId": [{ "shortName": "BrokerId", "name": "System.Guid? Sooloos.Broker.Api.PersistentPerformanceId::BrokerId", "propType": 13 }, { "shortName": "LibraryPerformanceId", "name": "System.Sooid? Sooloos.Broker.Api.PersistentPerformanceId::LibraryPerformanceId", "propType": 14 }, { "shortName": "ExternalPerformanceIds", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.PersistentPerformanceId::ExternalPerformanceIds", "propType": 23 }],
  "Sooloos.Broker.Api.PersistentLyricsId": [{ "shortName": "BrokerId", "name": "System.Guid? Sooloos.Broker.Api.PersistentLyricsId::BrokerId", "propType": 13 }, { "shortName": "LibraryLyricsId", "name": "System.Sooid? Sooloos.Broker.Api.PersistentLyricsId::LibraryLyricsId", "propType": 14 }, { "shortName": "ExternalLyricsIds", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.PersistentLyricsId::ExternalLyricsIds", "propType": 23 }],
  "Sooloos.Broker.Api.MobilePairingInfo": [{ "shortName": "Url", "name": "string Sooloos.Broker.Api.MobilePairingInfo::Url", "propType": 20 }],
  "Sooloos.Broker.Api.GetDiscoverDataParameters": [{ "shortName": "ProfileId", "name": "System.Sooid Sooloos.Broker.Api.GetDiscoverDataParameters::ProfileId", "propType": 4 }, { "shortName": "BirthYear", "name": "int Sooloos.Broker.Api.GetDiscoverDataParameters::BirthYear", "propType": 0 }, { "shortName": "MaxCount", "name": "int Sooloos.Broker.Api.GetDiscoverDataParameters::MaxCount", "propType": 0 }],
  "Sooloos.Broker.Api.GetHomeDataParameters": [{ "shortName": "ProfileId", "name": "System.Sooid Sooloos.Broker.Api.GetHomeDataParameters::ProfileId", "propType": 4 }, { "shortName": "MaxCount", "name": "int Sooloos.Broker.Api.GetHomeDataParameters::MaxCount", "propType": 0 }],
  "Sooloos.Broker.Api.TrackCollaboration": [{ "shortName": "FeaturedTrack", "name": "Sooloos.Broker.Api.FeaturedTrack Sooloos.Broker.Api.TrackCollaboration::FeaturedTrack", "propType": 23 }, { "shortName": "Performers", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackCollaboration::Performers", "propType": 23 }],
  "Sooloos.Broker.Api.AlbumReleaseInThePast": [{ "shortName": "FeaturedAlbum", "name": "Sooloos.Broker.Api.FeaturedAlbum Sooloos.Broker.Api.AlbumReleaseInThePast::FeaturedAlbum", "propType": 23 }, { "shortName": "Period", "name": "Sooloos.Broker.Api.AlbumReleaseInThePastPeriod Sooloos.Broker.Api.AlbumReleaseInThePast::Period", "propType": 9 }],
  "Sooloos.Broker.Api.FromMuchPlayedStyle": [{ "shortName": "Style", "name": "string Sooloos.Broker.Api.FromMuchPlayedStyle::Style", "propType": 20 }, { "shortName": "FeaturedAlbum", "name": "Sooloos.Broker.Api.FeaturedAlbum Sooloos.Broker.Api.FromMuchPlayedStyle::FeaturedAlbum", "propType": 23 }],
  "Sooloos.Broker.Api.FeaturedDecade": [{ "shortName": "Decade", "name": "int Sooloos.Broker.Api.FeaturedDecade::Decade", "propType": 0 }, { "shortName": "FeaturedAlbum", "name": "Sooloos.Broker.Api.FeaturedAlbum Sooloos.Broker.Api.FeaturedDecade::FeaturedAlbum", "propType": 23 }],
  "Sooloos.Broker.Api.FeaturedStyle": [{ "shortName": "FeaturedGenre", "name": "Sooloos.Broker.Api.FeaturedGenre Sooloos.Broker.Api.FeaturedStyle::FeaturedGenre", "propType": 23 }, { "shortName": "FeaturedAlbum", "name": "Sooloos.Broker.Api.FeaturedAlbum Sooloos.Broker.Api.FeaturedStyle::FeaturedAlbum", "propType": 23 }],
  "Sooloos.Broker.Api.FeaturedLabel": [{ "shortName": "Label", "name": "string Sooloos.Broker.Api.FeaturedLabel::Label", "propType": 20 }, { "shortName": "FeaturedAlbum", "name": "Sooloos.Broker.Api.FeaturedAlbum Sooloos.Broker.Api.FeaturedLabel::FeaturedAlbum", "propType": 23 }],
  "Sooloos.Broker.Api.FeaturedStyleDecade": [{ "shortName": "FeaturedGenre", "name": "Sooloos.Broker.Api.FeaturedGenre Sooloos.Broker.Api.FeaturedStyleDecade::FeaturedGenre", "propType": 23 }, { "shortName": "Decade", "name": "int Sooloos.Broker.Api.FeaturedStyleDecade::Decade", "propType": 0 }, { "shortName": "FeaturedAlbum", "name": "Sooloos.Broker.Api.FeaturedAlbum Sooloos.Broker.Api.FeaturedStyleDecade::FeaturedAlbum", "propType": 23 }],
  "Sooloos.Broker.Api.FeaturedLabelDecade": [{ "shortName": "Label", "name": "string Sooloos.Broker.Api.FeaturedLabelDecade::Label", "propType": 20 }, { "shortName": "Decade", "name": "int Sooloos.Broker.Api.FeaturedLabelDecade::Decade", "propType": 0 }, { "shortName": "FeaturedAlbum", "name": "Sooloos.Broker.Api.FeaturedAlbum Sooloos.Broker.Api.FeaturedLabelDecade::FeaturedAlbum", "propType": 23 }],
  "Sooloos.Broker.Api.FeaturedTrack": [{ "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.FeaturedTrack::Track", "propType": 23 }],
  "Sooloos.Broker.Api.FeaturedGenre": [{ "shortName": "Genre", "name": "Sooloos.Broker.Api.GenreLite Sooloos.Broker.Api.FeaturedGenre::Genre", "propType": 23 }, { "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.FeaturedGenre::Image", "propType": 23 }],
  "Sooloos.Broker.Api.FeaturedAlbum": [{ "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.FeaturedAlbum::Album", "propType": 23 }, { "shortName": "Review", "name": "string Sooloos.Broker.Api.FeaturedAlbum::Review", "propType": 20 }],
  "Sooloos.Broker.Api.FeaturedPerformer": [{ "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.FeaturedPerformer::Performer", "propType": 23 }, { "shortName": "Biography", "name": "string Sooloos.Broker.Api.FeaturedPerformer::Biography", "propType": 20 }, { "shortName": "ClassicalBiography", "name": "string Sooloos.Broker.Api.FeaturedPerformer::ClassicalBiography", "propType": 20 }],
  "Sooloos.Broker.Api.FeaturedWork": [{ "shortName": "Work", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.FeaturedWork::Work", "propType": 23 }],
  "Sooloos.Broker.Api.LocalizedText": [{ "shortName": "Languages", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.LocalizedText::Languages", "propType": 23 }, { "shortName": "Text", "name": "string Sooloos.Broker.Api.LocalizedText::Text", "propType": 20 }, { "shortName": "SortKey", "name": "string Sooloos.Broker.Api.LocalizedText::SortKey", "propType": 20 }, { "shortName": "IsNative", "name": "bool Sooloos.Broker.Api.LocalizedText::IsNative", "propType": 2 }],
  "Sooloos.Broker.Api.LocalizedTextLookup": [{ "shortName": "List", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.LocalizedText> Sooloos.Broker.Api.LocalizedTextLookup::List", "propType": 23 }, { "shortName": "Map", "name": "System.Collections.Generic.IDictionary<string, string> Sooloos.Broker.Api.LocalizedTextLookup::Map", "propType": 23 }, { "shortName": "Type", "name": "string Sooloos.Broker.Api.LocalizedTextLookup::Type", "propType": 20 }],
  "Sooloos.Broker.Api.LocalizedDescriptionText": [{ "shortName": "Source", "name": "string Sooloos.Broker.Api.LocalizedDescriptionText::Source", "propType": 20 }, { "shortName": "Language", "name": "string Sooloos.Broker.Api.LocalizedDescriptionText::Language", "propType": 20 }, { "shortName": "Text", "name": "string Sooloos.Broker.Api.LocalizedDescriptionText::Text", "propType": 20 }, { "shortName": "Author", "name": "string Sooloos.Broker.Api.LocalizedDescriptionText::Author", "propType": 20 }, { "shortName": "SourceUrl", "name": "string Sooloos.Broker.Api.LocalizedDescriptionText::SourceUrl", "propType": 20 }],
  "Sooloos.Broker.Api.LocalizedDescriptionContainer": [{ "shortName": "Blobs", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.LocalizedDescriptionText> Sooloos.Broker.Api.LocalizedDescriptionContainer::Blobs", "propType": 23 }, { "shortName": "Images", "name": "System.Collections.Generic.IDictionary<string, Sooloos.Broker.Api.Image> Sooloos.Broker.Api.LocalizedDescriptionContainer::Images", "propType": 23 }, { "shortName": "SelectedBlob", "name": "Sooloos.Broker.Api.LocalizedDescriptionText Sooloos.Broker.Api.LocalizedDescriptionContainer::SelectedBlob", "propType": 23 }],
  "Sooloos.Broker.Api.ProfileListeningDetails": [{ "shortName": "TimeSpanType", "name": "string Sooloos.Broker.Api.ProfileListeningDetails::TimeSpanType", "propType": 20 }, { "shortName": "FirstDay", "name": "System.DateTime Sooloos.Broker.Api.ProfileListeningDetails::FirstDay", "propType": 8 }, { "shortName": "LastDay", "name": "System.DateTime Sooloos.Broker.Api.ProfileListeningDetails::LastDay", "propType": 8 }, { "shortName": "TopPerformers", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.HistogramItem<Sooloos.Broker.Api.PerformerLite>> Sooloos.Broker.Api.ProfileListeningDetails::TopPerformers", "propType": 23 }, { "shortName": "MaxPerformerPlayTimeMinutes", "name": "int Sooloos.Broker.Api.ProfileListeningDetails::MaxPerformerPlayTimeMinutes", "propType": 0 }, { "shortName": "TopAlbums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.HistogramItem<Sooloos.Broker.Api.AlbumLite>> Sooloos.Broker.Api.ProfileListeningDetails::TopAlbums", "propType": 23 }, { "shortName": "MaxAlbumPlayTimeMinutes", "name": "int Sooloos.Broker.Api.ProfileListeningDetails::MaxAlbumPlayTimeMinutes", "propType": 0 }, { "shortName": "Genres", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.HistogramItem<Sooloos.Broker.Api.BrowserGenre>> Sooloos.Broker.Api.ProfileListeningDetails::Genres", "propType": 23 }],
  "Sooloos.Broker.Api.RecentItem": [{ "shortName": "ProfileId", "name": "System.Sooid Sooloos.Broker.Api.RecentItem::ProfileId", "propType": 4 }, { "shortName": "RecentId", "name": "long Sooloos.Broker.Api.RecentItem::RecentId", "propType": 1 }, { "shortName": "DataType", "name": "string Sooloos.Broker.Api.RecentItem::DataType", "propType": 20 }, { "shortName": "Type", "name": "string Sooloos.Broker.Api.RecentItem::Type", "propType": 20 }, { "shortName": "Time", "name": "System.DateTime Sooloos.Broker.Api.RecentItem::Time", "propType": 8 }, { "shortName": "Count", "name": "int Sooloos.Broker.Api.RecentItem::Count", "propType": 0 }, { "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.RecentItem::Album", "propType": 23 }, { "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.RecentItem::Track", "propType": 23 }, { "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.RecentItem::Performer", "propType": 23 }, { "shortName": "Work", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.RecentItem::Work", "propType": 23 }, { "shortName": "Channel", "name": "Sooloos.Broker.Api.Channel Sooloos.Broker.Api.RecentItem::Channel", "propType": 23 }, { "shortName": "Tag", "name": "Sooloos.Broker.Api.Tag Sooloos.Broker.Api.RecentItem::Tag", "propType": 23 }, { "shortName": "Playlist", "name": "Sooloos.Broker.Api.Playlist Sooloos.Broker.Api.RecentItem::Playlist", "propType": 23 }, { "shortName": "Genre", "name": "Sooloos.Broker.Api.BrowserGenre Sooloos.Broker.Api.RecentItem::Genre", "propType": 23 }, { "shortName": "Text", "name": "string Sooloos.Broker.Api.RecentItem::Text", "propType": 20 }, { "shortName": "RoonMobileRecentId", "name": "string Sooloos.Broker.Api.RecentItem::RoonMobileRecentId", "propType": 20 }],
  "Sooloos.Broker.Api.ListenLaterItem": [{ "shortName": "ProfileId", "name": "System.Sooid Sooloos.Broker.Api.ListenLaterItem::ProfileId", "propType": 4 }, { "shortName": "MediaId", "name": "long Sooloos.Broker.Api.ListenLaterItem::MediaId", "propType": 1 }, { "shortName": "State", "name": "Sooloos.Broker.Api.ListenLaterState Sooloos.Broker.Api.ListenLaterItem::State", "propType": 9 }, { "shortName": "Timestamp", "name": "System.DateTime Sooloos.Broker.Api.ListenLaterItem::Timestamp", "propType": 8 }, { "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.ListenLaterItem::Album", "propType": 23 }, { "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.ListenLaterItem::Track", "propType": 23 }, { "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.ListenLaterItem::Performer", "propType": 23 }, { "shortName": "DataType", "name": "string Sooloos.Broker.Api.ListenLaterItem::DataType", "propType": 20 }, { "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.ListenLaterItem::Image", "propType": 23 }, { "shortName": "Work", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.ListenLaterItem::Work", "propType": 23 }, { "shortName": "Channel", "name": "Sooloos.Broker.Api.Channel Sooloos.Broker.Api.ListenLaterItem::Channel", "propType": 23 }, { "shortName": "Tag", "name": "Sooloos.Broker.Api.Tag Sooloos.Broker.Api.ListenLaterItem::Tag", "propType": 23 }, { "shortName": "Playlist", "name": "Sooloos.Broker.Api.Playlist Sooloos.Broker.Api.ListenLaterItem::Playlist", "propType": 23 }, { "shortName": "Genre", "name": "Sooloos.Broker.Api.BrowserGenre Sooloos.Broker.Api.ListenLaterItem::Genre", "propType": 23 }, { "shortName": "Text", "name": "string Sooloos.Broker.Api.ListenLaterItem::Text", "propType": 20 }],
  "Sooloos.Broker.Api.LibrarySettingsInfo": [{ "shortName": "UseMetadataGenres", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::UseMetadataGenres", "propType": 2 }, { "shortName": "UseLocalGenres", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::UseLocalGenres", "propType": 2 }, { "shortName": "AlbumPreferLocalTitle", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalTitle", "propType": 2 }, { "shortName": "AlbumPreferLocalOriginalReleaseDate", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalOriginalReleaseDate", "propType": 2 }, { "shortName": "AlbumPreferLocalReleaseDate", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalReleaseDate", "propType": 2 }, { "shortName": "AlbumPreferLocalIsCompilation", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalIsCompilation", "propType": 2 }, { "shortName": "AlbumPreferLocalLabels", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalLabels", "propType": 2 }, { "shortName": "AlbumPreferLocalMainImage", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalMainImage", "propType": 20 }, { "shortName": "AlbumPreferLocalProductCode", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalProductCode", "propType": 2 }, { "shortName": "AlbumPreferLocalCatalogNumber", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalCatalogNumber", "propType": 2 }, { "shortName": "AlbumPreferLocalCountry", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalCountry", "propType": 2 }, { "shortName": "AlbumPreferLocalPerformedBy", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalPerformedBy", "propType": 2 }, { "shortName": "AlbumPreferLocalPerformanceGrouping", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumPreferLocalPerformanceGrouping", "propType": 2 }, { "shortName": "TrackPreferLocalTitle", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalTitle", "propType": 2 }, { "shortName": "TrackPreferLocalIsLive", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalIsLive", "propType": 2 }, { "shortName": "TrackPreferLocalLyrics", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalLyrics", "propType": 2 }, { "shortName": "TrackPreferLocalLRC", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalLRC", "propType": 2 }, { "shortName": "TrackPreferLocalTrackNumber", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalTrackNumber", "propType": 2 }, { "shortName": "TrackPreferLocalMediaNumber", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalMediaNumber", "propType": 2 }, { "shortName": "TrackPreferLocalPerformanceLocation", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalPerformanceLocation", "propType": 2 }, { "shortName": "TrackPreferLocalPerformanceStartDate", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalPerformanceStartDate", "propType": 2 }, { "shortName": "TrackPreferLocalPerformanceEndDate", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalPerformanceEndDate", "propType": 2 }, { "shortName": "TrackPreferLocalMainPerformerCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalMainPerformerCredits", "propType": 20 }, { "shortName": "TrackPreferLocalComposerCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalComposerCredits", "propType": 20 }, { "shortName": "TrackPreferLocalProductionCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalProductionCredits", "propType": 20 }, { "shortName": "TrackPreferLocalPerformerCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalPerformerCredits", "propType": 20 }, { "shortName": "TrackPreferLocalEnsembleCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalEnsembleCredits", "propType": 20 }, { "shortName": "TrackPreferLocalConductorCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferLocalConductorCredits", "propType": 20 }, { "shortName": "TrackImportDateBehavior", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::TrackImportDateBehavior", "propType": 20 }, { "shortName": "TrackImportDateUseImportDateTag", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackImportDateUseImportDateTag", "propType": 2 }, { "shortName": "TrackUseReplayGainTags", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackUseReplayGainTags", "propType": 2 }, { "shortName": "TrackPreferReplayGainTags", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::TrackPreferReplayGainTags", "propType": 2 }, { "shortName": "AlbumVersionSupportsParens", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumVersionSupportsParens", "propType": 2 }, { "shortName": "AlbumVersionSupportsBrackets", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumVersionSupportsBrackets", "propType": 2 }, { "shortName": "AlbumVersionSupportsBraces", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumVersionSupportsBraces", "propType": 2 }, { "shortName": "AlbumVersionSupportsAngles", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumVersionSupportsAngles", "propType": 2 }, { "shortName": "AlbumVersionExtractFromAlbumTitleTag", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumVersionExtractFromAlbumTitleTag", "propType": 2 }, { "shortName": "AlbumVersionExtractFromVersionTag", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumVersionExtractFromVersionTag", "propType": 2 }, { "shortName": "AlbumVersionExtractFromPaths", "name": "bool Sooloos.Broker.Api.LibrarySettingsInfo::AlbumVersionExtractFromPaths", "propType": 2 }, { "shortName": "ArtistTagDelimiters", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::ArtistTagDelimiters", "propType": 20 }, { "shortName": "GenreTagDelimiters", "name": "string Sooloos.Broker.Api.LibrarySettingsInfo::GenreTagDelimiters", "propType": 20 }],
  "Sooloos.Broker.Api.LibrarySettingsEdit": [{ "shortName": "UseMetadataGenres", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::UseMetadataGenres", "propType": 12 }, { "shortName": "UseLocalGenres", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::UseLocalGenres", "propType": 12 }, { "shortName": "AlbumPreferLocalTitle", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalTitle", "propType": 12 }, { "shortName": "AlbumPreferLocalOriginalReleaseDate", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalOriginalReleaseDate", "propType": 12 }, { "shortName": "AlbumPreferLocalReleaseDate", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalReleaseDate", "propType": 12 }, { "shortName": "AlbumPreferLocalIsCompilation", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalIsCompilation", "propType": 12 }, { "shortName": "AlbumPreferLocalLabels", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalLabels", "propType": 12 }, { "shortName": "AlbumPreferLocalMainImage", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalMainImage", "propType": 20 }, { "shortName": "AlbumPreferLocalProductCode", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalProductCode", "propType": 12 }, { "shortName": "AlbumPreferLocalCatalogNumber", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalCatalogNumber", "propType": 12 }, { "shortName": "AlbumPreferLocalCountry", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalCountry", "propType": 12 }, { "shortName": "AlbumPreferLocalPerformedBy", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalPerformedBy", "propType": 12 }, { "shortName": "AlbumPreferLocalPerformanceGrouping", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumPreferLocalPerformanceGrouping", "propType": 12 }, { "shortName": "TrackPreferLocalTitle", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalTitle", "propType": 12 }, { "shortName": "TrackPreferLocalIsLive", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalIsLive", "propType": 12 }, { "shortName": "TrackPreferLocalLyrics", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalLyrics", "propType": 12 }, { "shortName": "TrackPreferLocalLRC", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalLRC", "propType": 12 }, { "shortName": "TrackPreferLocalTrackNumber", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalTrackNumber", "propType": 12 }, { "shortName": "TrackPreferLocalMediaNumber", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalMediaNumber", "propType": 12 }, { "shortName": "TrackPreferLocalPerformanceLocation", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalPerformanceLocation", "propType": 12 }, { "shortName": "TrackPreferLocalPerformanceStartDate", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalPerformanceStartDate", "propType": 12 }, { "shortName": "TrackPreferLocalPerformanceEndDate", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalPerformanceEndDate", "propType": 12 }, { "shortName": "TrackPreferLocalMainPerformerCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalMainPerformerCredits", "propType": 20 }, { "shortName": "TrackPreferLocalComposerCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalComposerCredits", "propType": 20 }, { "shortName": "TrackPreferLocalProductionCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalProductionCredits", "propType": 20 }, { "shortName": "TrackPreferLocalPerformerCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalPerformerCredits", "propType": 20 }, { "shortName": "TrackPreferLocalEnsembleCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalEnsembleCredits", "propType": 20 }, { "shortName": "TrackPreferLocalConductorCredits", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferLocalConductorCredits", "propType": 20 }, { "shortName": "TrackImportDateBehavior", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::TrackImportDateBehavior", "propType": 20 }, { "shortName": "TrackImportDateUseImportDateTag", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackImportDateUseImportDateTag", "propType": 12 }, { "shortName": "TrackUseReplayGainTags", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackUseReplayGainTags", "propType": 12 }, { "shortName": "TrackPreferReplayGainTags", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::TrackPreferReplayGainTags", "propType": 12 }, { "shortName": "AlbumVersionSupportsParens", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumVersionSupportsParens", "propType": 12 }, { "shortName": "AlbumVersionSupportsBrackets", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumVersionSupportsBrackets", "propType": 12 }, { "shortName": "AlbumVersionSupportsBraces", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumVersionSupportsBraces", "propType": 12 }, { "shortName": "AlbumVersionSupportsAngles", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumVersionSupportsAngles", "propType": 12 }, { "shortName": "AlbumVersionExtractFromAlbumTitleTag", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumVersionExtractFromAlbumTitleTag", "propType": 12 }, { "shortName": "AlbumVersionExtractFromVersionTag", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumVersionExtractFromVersionTag", "propType": 12 }, { "shortName": "AlbumVersionExtractFromPaths", "name": "bool? Sooloos.Broker.Api.LibrarySettingsEdit::AlbumVersionExtractFromPaths", "propType": 12 }, { "shortName": "ArtistTagDelimiters", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::ArtistTagDelimiters", "propType": 20 }, { "shortName": "GenreTagDelimiters", "name": "string Sooloos.Broker.Api.LibrarySettingsEdit::GenreTagDelimiters", "propType": 20 }],
  "Sooloos.Broker.Api.DumpToExcelResult": [{ "shortName": "Data", "name": "System.Byte[] Sooloos.Broker.Api.DumpToExcelResult::Data", "propType": 21 }, { "shortName": "FileExtension", "name": "string Sooloos.Broker.Api.DumpToExcelResult::FileExtension", "propType": 20 }],
  "Sooloos.Broker.Api.AutocompleteParameters": [{ "shortName": "ProfileId", "name": "System.Sooid Sooloos.Broker.Api.AutocompleteParameters::ProfileId", "propType": 4 }, { "shortName": "Terms", "name": "string Sooloos.Broker.Api.AutocompleteParameters::Terms", "propType": 20 }, { "shortName": "MaxCount", "name": "int Sooloos.Broker.Api.AutocompleteParameters::MaxCount", "propType": 0 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.AutocompleteParameters::IncludeHidden", "propType": 2 }, { "shortName": "CancelKey", "name": "string Sooloos.Broker.Api.AutocompleteParameters::CancelKey", "propType": 20 }, { "shortName": "RequestTimeoutInMs", "name": "int Sooloos.Broker.Api.AutocompleteParameters::RequestTimeoutInMs", "propType": 0 }],
  "Sooloos.Broker.Api.SearchParameters": [{ "shortName": "ProfileId", "name": "System.Sooid Sooloos.Broker.Api.SearchParameters::ProfileId", "propType": 4 }, { "shortName": "Terms", "name": "string Sooloos.Broker.Api.SearchParameters::Terms", "propType": 20 }, { "shortName": "MaxCount", "name": "int Sooloos.Broker.Api.SearchParameters::MaxCount", "propType": 0 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.SearchParameters::IncludeHidden", "propType": 2 }, { "shortName": "CancelKey", "name": "string Sooloos.Broker.Api.SearchParameters::CancelKey", "propType": 20 }, { "shortName": "IsInstantSearch", "name": "bool Sooloos.Broker.Api.SearchParameters::IsInstantSearch", "propType": 2 }, { "shortName": "MaxTopResultCount", "name": "int Sooloos.Broker.Api.SearchParameters::MaxTopResultCount", "propType": 0 }, { "shortName": "RequestTimeoutInMs", "name": "int Sooloos.Broker.Api.SearchParameters::RequestTimeoutInMs", "propType": 0 }],
  "Sooloos.Broker.Api.VoiceSearchParameters": [{ "shortName": "ProfileId", "name": "System.Sooid Sooloos.Broker.Api.VoiceSearchParameters::ProfileId", "propType": 4 }, { "shortName": "IncludeHiddenItems", "name": "bool Sooloos.Broker.Api.VoiceSearchParameters::IncludeHiddenItems", "propType": 2 }, { "shortName": "Assistant", "name": "string Sooloos.Broker.Api.VoiceSearchParameters::Assistant", "propType": 20 }, { "shortName": "MediaName", "name": "string Sooloos.Broker.Api.VoiceSearchParameters::MediaName", "propType": 20 }, { "shortName": "ArtistName", "name": "string Sooloos.Broker.Api.VoiceSearchParameters::ArtistName", "propType": 20 }, { "shortName": "AlbumName", "name": "string Sooloos.Broker.Api.VoiceSearchParameters::AlbumName", "propType": 20 }, { "shortName": "GenreNames", "name": "Sooloos.Broker.Api.DataList<string> Sooloos.Broker.Api.VoiceSearchParameters::GenreNames", "propType": 23 }, { "shortName": "MoodNames", "name": "Sooloos.Broker.Api.DataList<string> Sooloos.Broker.Api.VoiceSearchParameters::MoodNames", "propType": 23 }, { "shortName": "MediaType", "name": "string Sooloos.Broker.Api.VoiceSearchParameters::MediaType", "propType": 20 }, { "shortName": "SortOrder", "name": "string Sooloos.Broker.Api.VoiceSearchParameters::SortOrder", "propType": 20 }, { "shortName": "ResultCount", "name": "int Sooloos.Broker.Api.VoiceSearchParameters::ResultCount", "propType": 0 }, { "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.VoiceSearchParameters::UiLanguage", "propType": 20 }],
  "Sooloos.Broker.Api.LibraryMaintenanceInfo": [{ "shortName": "AvailableTrackCount", "name": "int Sooloos.Broker.Api.LibraryMaintenanceInfo::AvailableTrackCount", "propType": 0 }, { "shortName": "TotalTrackCount", "name": "int Sooloos.Broker.Api.LibraryMaintenanceInfo::TotalTrackCount", "propType": 0 }, { "shortName": "DeletedTrackCount", "name": "int Sooloos.Broker.Api.LibraryMaintenanceInfo::DeletedTrackCount", "propType": 0 }, { "shortName": "UnconfiguredStorageTrackCount", "name": "int Sooloos.Broker.Api.LibraryMaintenanceInfo::UnconfiguredStorageTrackCount", "propType": 0 }, { "shortName": "DisabledStorageTrackCount", "name": "int Sooloos.Broker.Api.LibraryMaintenanceInfo::DisabledStorageTrackCount", "propType": 0 }],
  "Sooloos.Broker.Api.LibraryMaintenance": [{ "shortName": "CleanUpDeletedTracks", "name": "bool Sooloos.Broker.Api.LibraryMaintenance::CleanUpDeletedTracks", "propType": 2 }, { "shortName": "CleanUpUnconfiguredStorageTracks", "name": "bool Sooloos.Broker.Api.LibraryMaintenance::CleanUpUnconfiguredStorageTracks", "propType": 2 }, { "shortName": "CleanUpDisabledStorageTracks", "name": "bool Sooloos.Broker.Api.LibraryMaintenance::CleanUpDisabledStorageTracks", "propType": 2 }],
  "Sooloos.Broker.Api.FileSearchParameters": [{ "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.FileSearchParameters::TextFilter", "propType": 20 }, { "shortName": "TextFilterMatchesTags", "name": "bool Sooloos.Broker.Api.FileSearchParameters::TextFilterMatchesTags", "propType": 2 }, { "shortName": "TextFilterMatchesMetadata", "name": "bool Sooloos.Broker.Api.FileSearchParameters::TextFilterMatchesMetadata", "propType": 2 }, { "shortName": "TextFilterMatchesUserVisiblePath", "name": "bool Sooloos.Broker.Api.FileSearchParameters::TextFilterMatchesUserVisiblePath", "propType": 2 }, { "shortName": "SameDirectoriesAsTracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackBase> Sooloos.Broker.Api.FileSearchParameters::SameDirectoriesAsTracks", "propType": 23 }, { "shortName": "SameImportDateAsTracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackBase> Sooloos.Broker.Api.FileSearchParameters::SameImportDateAsTracks", "propType": 23 }, { "shortName": "SameImportDateRangeSeconds", "name": "int Sooloos.Broker.Api.FileSearchParameters::SameImportDateRangeSeconds", "propType": 0 }],
  "Sooloos.Broker.Api.FileSearchResult": [{ "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.FileSearchResult::Track", "propType": 23 }, { "shortName": "ModificationTime", "name": "System.DateTime? Sooloos.Broker.Api.FileSearchResult::ModificationTime", "propType": 18 }, { "shortName": "ImportDate", "name": "System.DateTime Sooloos.Broker.Api.FileSearchResult::ImportDate", "propType": 8 }, { "shortName": "UserVisiblePath", "name": "string Sooloos.Broker.Api.FileSearchResult::UserVisiblePath", "propType": 20 }, { "shortName": "UserVisibleDirectory", "name": "string Sooloos.Broker.Api.FileSearchResult::UserVisibleDirectory", "propType": 20 }, { "shortName": "FileMetadata", "name": "Sooloos.Broker.Api.FileMetadata Sooloos.Broker.Api.FileSearchResult::FileMetadata", "propType": 23 }],
  "Sooloos.Broker.Api.DumpToExcelSpec": [{ "shortName": "Tracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackBase> Sooloos.Broker.Api.DumpToExcelSpec::Tracks", "propType": 23 }, { "shortName": "Albums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumBase> Sooloos.Broker.Api.DumpToExcelSpec::Albums", "propType": 23 }, { "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.DumpToExcelSpec::Performers", "propType": 23 }, { "shortName": "Works", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkBase> Sooloos.Broker.Api.DumpToExcelSpec::Works", "propType": 23 }, { "shortName": "DumpAllTracks", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::DumpAllTracks", "propType": 2 }, { "shortName": "DumpAllAlbums", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::DumpAllAlbums", "propType": 2 }, { "shortName": "DumpAllPerformers", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::DumpAllPerformers", "propType": 2 }, { "shortName": "DumpAllWorks", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::DumpAllWorks", "propType": 2 }, { "shortName": "DumpAll", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::DumpAll", "propType": 2 }, { "shortName": "DumpAssociatedItems", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::DumpAssociatedItems", "propType": 2 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.DumpToExcelSpec::LanguagePreferences", "propType": 23 }, { "shortName": "PreserveOrder", "name": "bool Sooloos.Broker.Api.DumpToExcelSpec::PreserveOrder", "propType": 2 }],
  "Sooloos.Broker.Api.UnifiedAutocompleteSearchResults": [{ "shortName": "AutocompleteResults", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AutocompleteResult> Sooloos.Broker.Api.UnifiedAutocompleteSearchResults::AutocompleteResults", "propType": 23 }, { "shortName": "InstantSearchEvent", "name": "Sooloos.Broker.Api.InstantSearchEvent Sooloos.Broker.Api.UnifiedAutocompleteSearchResults::InstantSearchEvent", "propType": 23 }, { "shortName": "SearchResultState", "name": "Sooloos.Broker.Api.SearchResultState Sooloos.Broker.Api.UnifiedAutocompleteSearchResults::SearchResultState", "propType": 9 }],
  "Sooloos.Broker.Api.InstantSearchEvent": [{ "shortName": "Query", "name": "string Sooloos.Broker.Api.InstantSearchEvent::Query", "propType": 20 }, { "shortName": "Collections", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.InstantSearchEvent::Collections", "propType": 23 }, { "shortName": "ResponseTimeInMs", "name": "long Sooloos.Broker.Api.InstantSearchEvent::ResponseTimeInMs", "propType": 1 }, { "shortName": "SeeAllResultsClickedTimestampUtc", "name": "System.DateTime? Sooloos.Broker.Api.InstantSearchEvent::SeeAllResultsClickedTimestampUtc", "propType": 18 }, { "shortName": "Results", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.InstantSearchResult> Sooloos.Broker.Api.InstantSearchEvent::Results", "propType": 23 }, { "shortName": "StartTimeUtc", "name": "System.DateTime Sooloos.Broker.Api.InstantSearchEvent::StartTimeUtc", "propType": 8 }, { "shortName": "EnterPressedTimestampUtc", "name": "System.DateTime? Sooloos.Broker.Api.InstantSearchEvent::EnterPressedTimestampUtc", "propType": 18 }, { "shortName": "EventResolution", "name": "string Sooloos.Broker.Api.InstantSearchEvent::EventResolution", "propType": 20 }, { "shortName": "CloudTrace", "name": "Sooloos.Broker.Api.SearchCloudTrace Sooloos.Broker.Api.InstantSearchEvent::CloudTrace", "propType": 23 }, { "shortName": "ClientTrace", "name": "Sooloos.Broker.Api.SearchTrace Sooloos.Broker.Api.InstantSearchEvent::ClientTrace", "propType": 23 }, { "shortName": "IsClassical", "name": "bool Sooloos.Broker.Api.InstantSearchEvent::IsClassical", "propType": 2 }, { "shortName": "TestGroup", "name": "string Sooloos.Broker.Api.InstantSearchEvent::TestGroup", "propType": 20 }],
  "Sooloos.Broker.Api.SearchTrace": [{ "shortName": "Item", "name": "long Sooloos.Broker.Api.SearchTrace::Item", "propType": 1 }, { "shortName": "TotalElapsedInMs", "name": "long Sooloos.Broker.Api.SearchTrace::TotalElapsedInMs", "propType": 1 }],
  "Sooloos.Broker.Api.InstantSearchResult": [{ "shortName": "UserClickTimeInMs", "name": "double? Sooloos.Broker.Api.InstantSearchResult::UserClickTimeInMs", "propType": 15 }, { "shortName": "Position", "name": "int Sooloos.Broker.Api.InstantSearchResult::Position", "propType": 0 }, { "shortName": "Queries", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.InstantSearchResult::Queries", "propType": 23 }, { "shortName": "AutocompleteResult", "name": "Sooloos.Broker.Api.AutocompleteResult Sooloos.Broker.Api.InstantSearchResult::AutocompleteResult", "propType": 23 }],
  "Sooloos.Broker.Api.TopSearchResult": [{ "shortName": "PublicId", "name": "string Sooloos.Broker.Api.TopSearchResult::PublicId", "propType": 20 }, { "shortName": "Score", "name": "double Sooloos.Broker.Api.TopSearchResult::Score", "propType": 5 }, { "shortName": "Popularity", "name": "double Sooloos.Broker.Api.TopSearchResult::Popularity", "propType": 5 }, { "shortName": "BaseScore", "name": "double Sooloos.Broker.Api.TopSearchResult::BaseScore", "propType": 5 }, { "shortName": "LocalScore", "name": "double? Sooloos.Broker.Api.TopSearchResult::LocalScore", "propType": 15 }, { "shortName": "StreamingScore", "name": "double? Sooloos.Broker.Api.TopSearchResult::StreamingScore", "propType": 15 }, { "shortName": "IsLocal", "name": "bool Sooloos.Broker.Api.TopSearchResult::IsLocal", "propType": 2 }, { "shortName": "Artist", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.TopSearchResult::Artist", "propType": 23 }, { "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.TopSearchResult::Album", "propType": 23 }, { "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.TopSearchResult::Track", "propType": 23 }, { "shortName": "Work", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.TopSearchResult::Work", "propType": 23 }, { "shortName": "Tag", "name": "Sooloos.Broker.Api.Tag Sooloos.Broker.Api.TopSearchResult::Tag", "propType": 23 }, { "shortName": "Playlist", "name": "Sooloos.Broker.Api.Playlist Sooloos.Broker.Api.TopSearchResult::Playlist", "propType": 23 }, { "shortName": "Genre", "name": "Sooloos.Broker.Api.BrowserGenre Sooloos.Broker.Api.TopSearchResult::Genre", "propType": 23 }, { "shortName": "LibraryArtist", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.TopSearchResult::LibraryArtist", "propType": 23 }, { "shortName": "LibraryAlbum", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.TopSearchResult::LibraryAlbum", "propType": 23 }, { "shortName": "LibraryTrack", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.TopSearchResult::LibraryTrack", "propType": 23 }, { "shortName": "LibraryWork", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.TopSearchResult::LibraryWork", "propType": 23 }],
  "Sooloos.Broker.Api.AutocompleteResult": [{ "shortName": "PublicId", "name": "string Sooloos.Broker.Api.AutocompleteResult::PublicId", "propType": 20 }, { "shortName": "Score", "name": "double Sooloos.Broker.Api.AutocompleteResult::Score", "propType": 5 }, { "shortName": "Popularity", "name": "double Sooloos.Broker.Api.AutocompleteResult::Popularity", "propType": 5 }, { "shortName": "IsLocal", "name": "bool Sooloos.Broker.Api.AutocompleteResult::IsLocal", "propType": 2 }, { "shortName": "Queries", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AutocompleteResult::Queries", "propType": 23 }, { "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.AutocompleteResult::Performer", "propType": 23 }, { "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.AutocompleteResult::Album", "propType": 23 }, { "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.AutocompleteResult::Track", "propType": 23 }, { "shortName": "Work", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.AutocompleteResult::Work", "propType": 23 }, { "shortName": "Tag", "name": "Sooloos.Broker.Api.Tag Sooloos.Broker.Api.AutocompleteResult::Tag", "propType": 23 }, { "shortName": "Playlist", "name": "Sooloos.Broker.Api.Playlist Sooloos.Broker.Api.AutocompleteResult::Playlist", "propType": 23 }, { "shortName": "Genre", "name": "Sooloos.Broker.Api.BrowserGenre Sooloos.Broker.Api.AutocompleteResult::Genre", "propType": 23 }],
  "Sooloos.Broker.Api.UnifiedSearchEvent": [{ "shortName": "Id", "name": "string Sooloos.Broker.Api.UnifiedSearchEvent::Id", "propType": 20 }, { "shortName": "Query", "name": "string Sooloos.Broker.Api.UnifiedSearchEvent::Query", "propType": 20 }, { "shortName": "Filter", "name": "string Sooloos.Broker.Api.UnifiedSearchEvent::Filter", "propType": 20 }, { "shortName": "Collections", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.UnifiedSearchEvent::Collections", "propType": 23 }, { "shortName": "ResponseTimeInMs", "name": "long Sooloos.Broker.Api.UnifiedSearchEvent::ResponseTimeInMs", "propType": 1 }, { "shortName": "InteractionTimeInMs", "name": "long? Sooloos.Broker.Api.UnifiedSearchEvent::InteractionTimeInMs", "propType": 11 }, { "shortName": "SelectedType", "name": "string Sooloos.Broker.Api.UnifiedSearchEvent::SelectedType", "propType": 20 }, { "shortName": "SelectedPosition", "name": "int? Sooloos.Broker.Api.UnifiedSearchEvent::SelectedPosition", "propType": 10 }, { "shortName": "EventResolution", "name": "string Sooloos.Broker.Api.UnifiedSearchEvent::EventResolution", "propType": 20 }, { "shortName": "TargetPage", "name": "string Sooloos.Broker.Api.UnifiedSearchEvent::TargetPage", "propType": 20 }, { "shortName": "IsClassical", "name": "bool Sooloos.Broker.Api.UnifiedSearchEvent::IsClassical", "propType": 2 }, { "shortName": "OnlyLibrary", "name": "bool Sooloos.Broker.Api.UnifiedSearchEvent::OnlyLibrary", "propType": 2 }, { "shortName": "TestGroup", "name": "string Sooloos.Broker.Api.UnifiedSearchEvent::TestGroup", "propType": 20 }, { "shortName": "TopResult", "name": "Sooloos.Broker.Api.SearchResultEventItem Sooloos.Broker.Api.UnifiedSearchEvent::TopResult", "propType": 23 }, { "shortName": "LibraryTopResult", "name": "Sooloos.Broker.Api.SearchResultEventItem Sooloos.Broker.Api.UnifiedSearchEvent::LibraryTopResult", "propType": 23 }, { "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Performers", "propType": 23 }, { "shortName": "Composers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Composers", "propType": 23 }, { "shortName": "Albums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Albums", "propType": 23 }, { "shortName": "Tracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Tracks", "propType": 23 }, { "shortName": "Songs", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Songs", "propType": 23 }, { "shortName": "Venues", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Venues", "propType": 23 }, { "shortName": "Works", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Works", "propType": 23 }, { "shortName": "Playlists", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Playlists", "propType": 23 }, { "shortName": "Labels", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Labels", "propType": 23 }, { "shortName": "Genres", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Genres", "propType": 23 }, { "shortName": "Tags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Tags", "propType": 23 }, { "shortName": "Channels", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SearchResultEventItem> Sooloos.Broker.Api.UnifiedSearchEvent::Channels", "propType": 23 }],
  "Sooloos.Broker.Api.SearchResultEventItem": [{ "shortName": "Id", "name": "string Sooloos.Broker.Api.SearchResultEventItem::Id", "propType": 20 }, { "shortName": "MainLabel", "name": "string Sooloos.Broker.Api.SearchResultEventItem::MainLabel", "propType": 20 }, { "shortName": "SecondaryLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SearchResultEventItem::SecondaryLabels", "propType": 23 }, { "shortName": "IsLibraryItem", "name": "bool Sooloos.Broker.Api.SearchResultEventItem::IsLibraryItem", "propType": 2 }, { "shortName": "IsFavorite", "name": "bool Sooloos.Broker.Api.SearchResultEventItem::IsFavorite", "propType": 2 }, { "shortName": "HasImage", "name": "bool Sooloos.Broker.Api.SearchResultEventItem::HasImage", "propType": 2 }, { "shortName": "IsIdentified", "name": "bool Sooloos.Broker.Api.SearchResultEventItem::IsIdentified", "propType": 2 }, { "shortName": "MetaInfo", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SearchResultEventItem::MetaInfo", "propType": 23 }, { "shortName": "Type", "name": "string Sooloos.Broker.Api.SearchResultEventItem::Type", "propType": 20 }],
  "Sooloos.Broker.Api.PublishSearchEventParameters": [{ "shortName": "SelectedPosition", "name": "int? Sooloos.Broker.Api.PublishSearchEventParameters::SelectedPosition", "propType": 10 }, { "shortName": "SelectedType", "name": "string Sooloos.Broker.Api.PublishSearchEventParameters::SelectedType", "propType": 20 }, { "shortName": "InteractionTimeInMs", "name": "long Sooloos.Broker.Api.PublishSearchEventParameters::InteractionTimeInMs", "propType": 1 }, { "shortName": "Source", "name": "string Sooloos.Broker.Api.PublishSearchEventParameters::Source", "propType": 20 }, { "shortName": "Filter", "name": "string Sooloos.Broker.Api.PublishSearchEventParameters::Filter", "propType": 20 }, { "shortName": "OnlyLibrary", "name": "bool Sooloos.Broker.Api.PublishSearchEventParameters::OnlyLibrary", "propType": 2 }, { "shortName": "TargetPage", "name": "string Sooloos.Broker.Api.PublishSearchEventParameters::TargetPage", "propType": 20 }],
  "Sooloos.Broker.Api.SearchCloudTrace": [{ "shortName": "RequestedSize", "name": "long Sooloos.Broker.Api.SearchCloudTrace::RequestedSize", "propType": 1 }, { "shortName": "TotalRequestTimeInMs", "name": "long Sooloos.Broker.Api.SearchCloudTrace::TotalRequestTimeInMs", "propType": 1 }, { "shortName": "ElasticInternalTimeMs", "name": "long Sooloos.Broker.Api.SearchCloudTrace::ElasticInternalTimeMs", "propType": 1 }, { "shortName": "ElasticResultParsingMs", "name": "long Sooloos.Broker.Api.SearchCloudTrace::ElasticResultParsingMs", "propType": 1 }, { "shortName": "MetadataFetchingMs", "name": "long Sooloos.Broker.Api.SearchCloudTrace::MetadataFetchingMs", "propType": 1 }, { "shortName": "ResultBuildingMs", "name": "long Sooloos.Broker.Api.SearchCloudTrace::ResultBuildingMs", "propType": 1 }, { "shortName": "IsCacheHit", "name": "bool Sooloos.Broker.Api.SearchCloudTrace::IsCacheHit", "propType": 2 }, { "shortName": "CacheResponseTimeMs", "name": "long Sooloos.Broker.Api.SearchCloudTrace::CacheResponseTimeMs", "propType": 1 }, { "shortName": "TrackTrace", "name": "Sooloos.Broker.Api.SearchCloudTypeTrace Sooloos.Broker.Api.SearchCloudTrace::TrackTrace", "propType": 23 }, { "shortName": "AlbumTrace", "name": "Sooloos.Broker.Api.SearchCloudTypeTrace Sooloos.Broker.Api.SearchCloudTrace::AlbumTrace", "propType": 23 }, { "shortName": "PerformerTrace", "name": "Sooloos.Broker.Api.SearchCloudTypeTrace Sooloos.Broker.Api.SearchCloudTrace::PerformerTrace", "propType": 23 }, { "shortName": "ComposerTrace", "name": "Sooloos.Broker.Api.SearchCloudTypeTrace Sooloos.Broker.Api.SearchCloudTrace::ComposerTrace", "propType": 23 }, { "shortName": "WorkTrace", "name": "Sooloos.Broker.Api.SearchCloudTypeTrace Sooloos.Broker.Api.SearchCloudTrace::WorkTrace", "propType": 23 }, { "shortName": "GenreTrace", "name": "Sooloos.Broker.Api.SearchCloudTypeTrace Sooloos.Broker.Api.SearchCloudTrace::GenreTrace", "propType": 23 }],
  "Sooloos.Broker.Api.SearchCloudTypeTrace": [{ "shortName": "ElasticTimeInMs", "name": "long Sooloos.Broker.Api.SearchCloudTypeTrace::ElasticTimeInMs", "propType": 1 }, { "shortName": "TotalResults", "name": "long Sooloos.Broker.Api.SearchCloudTypeTrace::TotalResults", "propType": 1 }, { "shortName": "MetadataFetchingTimeInMs", "name": "long Sooloos.Broker.Api.SearchCloudTypeTrace::MetadataFetchingTimeInMs", "propType": 1 }],
  "Sooloos.Broker.Api.TrackExportInfo": [{ "shortName": "TrackId", "name": "System.Sooid Sooloos.Broker.Api.TrackExportInfo::TrackId", "propType": 4 }, { "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.TrackExportInfo::Track", "propType": 23 }, { "shortName": "Format", "name": "Sooloos.Broker.Api.FileFormat Sooloos.Broker.Api.TrackExportInfo::Format", "propType": 9 }, { "shortName": "FilePath", "name": "string Sooloos.Broker.Api.TrackExportInfo::FilePath", "propType": 20 }, { "shortName": "HttpPath", "name": "string Sooloos.Broker.Api.TrackExportInfo::HttpPath", "propType": 20 }, { "shortName": "DuplicateTracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackExportInfo> Sooloos.Broker.Api.TrackExportInfo::DuplicateTracks", "propType": 23 }, { "shortName": "FileTags", "name": "System.Collections.Generic.IList<System.Tuple<string, string>> Sooloos.Broker.Api.TrackExportInfo::FileTags", "propType": 23 }, { "shortName": "MQAOriginalSampleRate", "name": "int? Sooloos.Broker.Api.TrackExportInfo::MQAOriginalSampleRate", "propType": 10 }],
  "Sooloos.Broker.Api.ImportCandidate": [{ "shortName": "LocalFilePath", "name": "string Sooloos.Broker.Api.ImportCandidate::LocalFilePath", "propType": 20 }, { "shortName": "FileSignature", "name": "System.Byte[] Sooloos.Broker.Api.ImportCandidate::FileSignature", "propType": 21 }],
  "Sooloos.Broker.Api.ImportCandidateStatus": [{ "shortName": "LocalFilePath", "name": "string Sooloos.Broker.Api.ImportCandidateStatus::LocalFilePath", "propType": 20 }, { "shortName": "DuplicateOf", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.ImportCandidateStatus::DuplicateOf", "propType": 23 }],
  "Sooloos.Broker.Api.Instrumentation": [{ "shortName": "Summary", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.InstrumentationElement> Sooloos.Broker.Api.Instrumentation::Summary", "propType": 23 }, { "shortName": "Details", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.InstrumentationElement> Sooloos.Broker.Api.Instrumentation::Details", "propType": 23 }],
  "Sooloos.Broker.Api.InstrumentationElement": [{ "shortName": "Type", "name": "Sooloos.Broker.Api.InstrumentationElementType Sooloos.Broker.Api.InstrumentationElement::Type", "propType": 9 }, { "shortName": "Name", "name": "string Sooloos.Broker.Api.InstrumentationElement::Name", "propType": 20 }, { "shortName": "IsCustom", "name": "bool Sooloos.Broker.Api.InstrumentationElement::IsCustom", "propType": 2 }, { "shortName": "Count", "name": "int? Sooloos.Broker.Api.InstrumentationElement::Count", "propType": 10 }],
  "Sooloos.Broker.Api.CatalogNumber": [{ "shortName": "SystemName", "name": "string Sooloos.Broker.Api.CatalogNumber::SystemName", "propType": 20 }, { "shortName": "Number", "name": "string Sooloos.Broker.Api.CatalogNumber::Number", "propType": 20 }, { "shortName": "IsPartial", "name": "bool Sooloos.Broker.Api.CatalogNumber::IsPartial", "propType": 2 }],
  "Sooloos.Broker.Api.ReviewedAlbumLite": [{ "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.ReviewedAlbumLite::Album", "propType": 23 }, { "shortName": "Review", "name": "Sooloos.Broker.Api.Review Sooloos.Broker.Api.ReviewedAlbumLite::Review", "propType": 23 }],
  "Sooloos.Broker.Api.AlternateAlbumVersion": [{ "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.AlternateAlbumVersion::Album", "propType": 23 }, { "shortName": "Version", "name": "string Sooloos.Broker.Api.AlternateAlbumVersion::Version", "propType": 20 }, { "shortName": "TrackCount", "name": "int Sooloos.Broker.Api.AlternateAlbumVersion::TrackCount", "propType": 0 }, { "shortName": "Formats", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlternateAlbumVersion::Formats", "propType": 23 }, { "shortName": "ContentSources", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.MediaSource> Sooloos.Broker.Api.AlternateAlbumVersion::ContentSources", "propType": 23 }, { "shortName": "ContentLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ContentLocation> Sooloos.Broker.Api.AlternateAlbumVersion::ContentLocations", "propType": 23 }],
  "Sooloos.Broker.Api.AlternateAlbumVersions": [{ "shortName": "LibraryGroupVersions", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlternateAlbumVersion> Sooloos.Broker.Api.AlternateAlbumVersions::LibraryGroupVersions", "propType": 23 }, { "shortName": "LibraryOtherVersions", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlternateAlbumVersion> Sooloos.Broker.Api.AlternateAlbumVersions::LibraryOtherVersions", "propType": 23 }, { "shortName": "StreamingVersions", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlternateAlbumVersion> Sooloos.Broker.Api.AlternateAlbumVersions::StreamingVersions", "propType": 23 }],
  "Sooloos.Broker.Api.ContentLocation": [{ "shortName": "LocationId", "name": "System.Guid Sooloos.Broker.Api.ContentLocation::LocationId", "propType": 3 }, { "shortName": "RelativePath", "name": "string Sooloos.Broker.Api.ContentLocation::RelativePath", "propType": 20 }],
  "Sooloos.Broker.Api.WorkCounts": [{ "shortName": "Work", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.WorkCounts::Work", "propType": 23 }, { "shortName": "LibraryCount", "name": "int Sooloos.Broker.Api.WorkCounts::LibraryCount", "propType": 0 }, { "shortName": "TotalCount", "name": "int Sooloos.Broker.Api.WorkCounts::TotalCount", "propType": 0 }, { "shortName": "LibraryCompleteCount", "name": "int Sooloos.Broker.Api.WorkCounts::LibraryCompleteCount", "propType": 0 }, { "shortName": "TotalCompleteCount", "name": "int Sooloos.Broker.Api.WorkCounts::TotalCompleteCount", "propType": 0 }],
  "Sooloos.Broker.Api.WorkPerformanceQueryCriteria": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.WorkPerformanceQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "Ordering", "name": "Sooloos.Broker.Api.PerformanceQueryOrdering Sooloos.Broker.Api.WorkPerformanceQueryCriteria::Ordering", "propType": 23 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.WorkPerformanceQueryCriteria::IncludeHidden", "propType": 2 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.WorkPerformanceQueryCriteria::TextFilter", "propType": 20 }],
  "Sooloos.Broker.Api.PerformerWorkQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.WorkQueryOrdering Sooloos.Broker.Api.PerformerWorkQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.PerformerWorkQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerWorkQueryCriteria::LanguagePreferences", "propType": 23 }, { "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.PerformerWorkQueryCriteria::UiLanguage", "propType": 20 }],
  "Sooloos.Broker.Api.PerformerAlbumQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.AlbumQueryOrdering Sooloos.Broker.Api.PerformerAlbumQueryCriteria::Ordering", "propType": 23 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.PerformerAlbumQueryCriteria::IncludeHidden", "propType": 2 }, { "shortName": "ExcludeIsInLibrary", "name": "bool Sooloos.Broker.Api.PerformerAlbumQueryCriteria::ExcludeIsInLibrary", "propType": 2 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerAlbumQueryCriteria::LanguagePreferences", "propType": 23 }, { "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.PerformerAlbumQueryCriteria::UiLanguage", "propType": 20 }],
  "Sooloos.Broker.Api.Description": [{ "shortName": "Text", "name": "string Sooloos.Broker.Api.Description::Text", "propType": 20 }, { "shortName": "Author", "name": "string Sooloos.Broker.Api.Description::Author", "propType": 20 }],
  "Sooloos.Broker.Api.Review": [{ "shortName": "Text", "name": "string Sooloos.Broker.Api.Review::Text", "propType": 20 }, { "shortName": "Author", "name": "string Sooloos.Broker.Api.Review::Author", "propType": 20 }],
  "Sooloos.Broker.Api.Biography": [{ "shortName": "Text", "name": "string Sooloos.Broker.Api.Biography::Text", "propType": 20 }, { "shortName": "Author", "name": "string Sooloos.Broker.Api.Biography::Author", "propType": 20 }],
  "Sooloos.Broker.Api.Lyrics": [{ "shortName": "LyricsSooid", "name": "System.Sooid? Sooloos.Broker.Api.Lyrics::LyricsSooid", "propType": 14 }, { "shortName": "Text", "name": "string Sooloos.Broker.Api.Lyrics::Text", "propType": 20 }, { "shortName": "LRC", "name": "string Sooloos.Broker.Api.Lyrics::LRC", "propType": 20 }, { "shortName": "Author", "name": "string Sooloos.Broker.Api.Lyrics::Author", "propType": 20 }, { "shortName": "Publisher", "name": "string Sooloos.Broker.Api.Lyrics::Publisher", "propType": 20 }],
  "Sooloos.Broker.Api.RelatedUrl": [{ "shortName": "Url", "name": "string Sooloos.Broker.Api.RelatedUrl::Url", "propType": 20 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.RelatedUrlType Sooloos.Broker.Api.RelatedUrl::Type", "propType": 9 }],
  "Sooloos.Broker.Api.GetGenreParameters": [{ "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.GetGenreParameters::IncludeHidden", "propType": 2 }],
  "Sooloos.Broker.Api.Credit": [{ "shortName": "Role", "name": "string Sooloos.Broker.Api.Credit::Role", "propType": 20 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.CreditType Sooloos.Broker.Api.Credit::Type", "propType": 9 }, { "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.Credit::Performer", "propType": 23 }],
  "Sooloos.Broker.Api.VolumeNormalizationData": [{ "shortName": "Source", "name": "Sooloos.Broker.Api.VolumeNormalizationDataSource Sooloos.Broker.Api.VolumeNormalizationData::Source", "propType": 9 }, { "shortName": "TrackGainDb", "name": "double? Sooloos.Broker.Api.VolumeNormalizationData::TrackGainDb", "propType": 15 }, { "shortName": "AlbumGainDb", "name": "double? Sooloos.Broker.Api.VolumeNormalizationData::AlbumGainDb", "propType": 15 }, { "shortName": "TrackPeakDb", "name": "double? Sooloos.Broker.Api.VolumeNormalizationData::TrackPeakDb", "propType": 15 }, { "shortName": "AlbumPeakDb", "name": "double? Sooloos.Broker.Api.VolumeNormalizationData::AlbumPeakDb", "propType": 15 }],
  "Sooloos.Broker.Api.FilePathInfo": [{ "shortName": "UserVisiblePath", "name": "string Sooloos.Broker.Api.FilePathInfo::UserVisiblePath", "propType": 20 }, { "shortName": "LocalPath", "name": "string Sooloos.Broker.Api.FilePathInfo::LocalPath", "propType": 20 }],
  "Sooloos.Broker.Api.FileMetadata": [{ "shortName": "AlbumMainPerformer", "name": "string Sooloos.Broker.Api.FileMetadata::AlbumMainPerformer", "propType": 20 }, { "shortName": "TrackMainPerformer", "name": "string Sooloos.Broker.Api.FileMetadata::TrackMainPerformer", "propType": 20 }, { "shortName": "AlbumTitle", "name": "string Sooloos.Broker.Api.FileMetadata::AlbumTitle", "propType": 20 }, { "shortName": "Title", "name": "string Sooloos.Broker.Api.FileMetadata::Title", "propType": 20 }, { "shortName": "TrackNumber", "name": "int? Sooloos.Broker.Api.FileMetadata::TrackNumber", "propType": 10 }, { "shortName": "MediaNumber", "name": "int? Sooloos.Broker.Api.FileMetadata::MediaNumber", "propType": 10 }, { "shortName": "TrackNumberFromFilename", "name": "int? Sooloos.Broker.Api.FileMetadata::TrackNumberFromFilename", "propType": 10 }, { "shortName": "MediaNumberFromFilename", "name": "int? Sooloos.Broker.Api.FileMetadata::MediaNumberFromFilename", "propType": 10 }, { "shortName": "Date", "name": "Sooloos.NullDate Sooloos.Broker.Api.FileMetadata::Date", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerMixDescription": [{ "shortName": "PerformerName", "name": "string Sooloos.Broker.Api.PerformerMixDescription::PerformerName", "propType": 20 }, { "shortName": "Avatar", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.PerformerMixDescription::Avatar", "propType": 23 }, { "shortName": "Photo", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.PerformerMixDescription::Photo", "propType": 23 }, { "shortName": "Touchstones", "name": "Sooloos.Broker.Api.DataList<string> Sooloos.Broker.Api.PerformerMixDescription::Touchstones", "propType": 23 }],
  "Sooloos.Broker.Api.GenreMixDescription": [{ "shortName": "GenreName", "name": "string Sooloos.Broker.Api.GenreMixDescription::GenreName", "propType": 20 }, { "shortName": "Images", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.GenreMixDescription::Images", "propType": 23 }, { "shortName": "Touchstones", "name": "Sooloos.Broker.Api.DataList<string> Sooloos.Broker.Api.GenreMixDescription::Touchstones", "propType": 23 }],
  "Sooloos.Broker.Api.PlaylistItemQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.PlaylistItemOrdering Sooloos.Broker.Api.PlaylistItemQueryOrdering::Ordering", "propType": 9 }, { "shortName": "TrackOrdering", "name": "Sooloos.Broker.Api.TrackOrdering? Sooloos.Broker.Api.PlaylistItemQueryOrdering::TrackOrdering", "propType": 19 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.PlaylistItemQueryOrdering::Direction", "propType": 9 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.PlaylistItemQueryOrdering::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.PlaylistItemQueryOrdering::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "AlbumDatePreference", "name": "Sooloos.Broker.Api.AlbumDatePreference Sooloos.Broker.Api.PlaylistItemQueryOrdering::AlbumDatePreference", "propType": 9 }, { "shortName": "VariousArtistsSortKey", "name": "string Sooloos.Broker.Api.PlaylistItemQueryOrdering::VariousArtistsSortKey", "propType": 20 }],
  "Sooloos.Broker.Api.PlaylistItemQueryCriteria": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.PlaylistItemQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "Ordering", "name": "Sooloos.Broker.Api.PlaylistItemQueryOrdering Sooloos.Broker.Api.PlaylistItemQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TrackTitleTextFilter", "name": "string Sooloos.Broker.Api.PlaylistItemQueryCriteria::TrackTitleTextFilter", "propType": 20 }, { "shortName": "AlbumTitleTextFilter", "name": "string Sooloos.Broker.Api.PlaylistItemQueryCriteria::AlbumTitleTextFilter", "propType": 20 }, { "shortName": "AlbumPerformedByTextFilter", "name": "string Sooloos.Broker.Api.PlaylistItemQueryCriteria::AlbumPerformedByTextFilter", "propType": 20 }, { "shortName": "TrackMainPerformerTextFilter", "name": "string Sooloos.Broker.Api.PlaylistItemQueryCriteria::TrackMainPerformerTextFilter", "propType": 20 }, { "shortName": "TrackComposerTextFilter", "name": "string Sooloos.Broker.Api.PlaylistItemQueryCriteria::TrackComposerTextFilter", "propType": 20 }, { "shortName": "PathTextFilter", "name": "string Sooloos.Broker.Api.PlaylistItemQueryCriteria::PathTextFilter", "propType": 20 }, { "shortName": "RequireDuplicates", "name": "bool Sooloos.Broker.Api.PlaylistItemQueryCriteria::RequireDuplicates", "propType": 2 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PlaylistItemQueryCriteria::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.PlaylistParameters": [{ "shortName": "PlaylistId", "name": "System.Sooid? Sooloos.Broker.Api.PlaylistParameters::PlaylistId", "propType": 14 }, { "shortName": "Profile", "name": "Sooloos.Broker.Api.Profile Sooloos.Broker.Api.PlaylistParameters::Profile", "propType": 23 }, { "shortName": "Name", "name": "string Sooloos.Broker.Api.PlaylistParameters::Name", "propType": 20 }, { "shortName": "Description", "name": "string Sooloos.Broker.Api.PlaylistParameters::Description", "propType": 20 }, { "shortName": "PlaylistFolderId", "name": "System.Sooid? Sooloos.Broker.Api.PlaylistParameters::PlaylistFolderId", "propType": 14 }, { "shortName": "AlbumCriteria", "name": "Sooloos.Broker.Api.AlbumQueryCriteria Sooloos.Broker.Api.PlaylistParameters::AlbumCriteria", "propType": 23 }, { "shortName": "TrackCriteria", "name": "Sooloos.Broker.Api.TrackQueryCriteria Sooloos.Broker.Api.PlaylistParameters::TrackCriteria", "propType": 23 }],
  "Sooloos.Broker.Api.PlaylistInsertionResult": [{ "shortName": "TotalTrackCount", "name": "int Sooloos.Broker.Api.PlaylistInsertionResult::TotalTrackCount", "propType": 0 }, { "shortName": "UntranslatedTrackCount", "name": "int Sooloos.Broker.Api.PlaylistInsertionResult::UntranslatedTrackCount", "propType": 0 }],
  "Sooloos.Broker.Api.PlaylistDuplicateCheckResult": [{ "shortName": "TotalTrackCount", "name": "int Sooloos.Broker.Api.PlaylistDuplicateCheckResult::TotalTrackCount", "propType": 0 }, { "shortName": "DuplicateTrackCount", "name": "int Sooloos.Broker.Api.PlaylistDuplicateCheckResult::DuplicateTrackCount", "propType": 0 }, { "shortName": "DuplicateSource", "name": "Sooloos.Broker.Api.DuplicateSource Sooloos.Broker.Api.PlaylistDuplicateCheckResult::DuplicateSource", "propType": 9 }],
  "Sooloos.Broker.Api.PlaylistDuplicateCheckParameters": [{ "shortName": "Playlist", "name": "Sooloos.Broker.Api.Playlist Sooloos.Broker.Api.PlaylistDuplicateCheckParameters::Playlist", "propType": 23 }, { "shortName": "MediaIds", "name": "System.Collections.Generic.IList<long> Sooloos.Broker.Api.PlaylistDuplicateCheckParameters::MediaIds", "propType": 23 }, { "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.PlaylistDuplicateCheckParameters::Performers", "propType": 23 }, { "shortName": "Composers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.PlaylistDuplicateCheckParameters::Composers", "propType": 23 }, { "shortName": "Performances", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformanceBase> Sooloos.Broker.Api.PlaylistDuplicateCheckParameters::Performances", "propType": 23 }, { "shortName": "Playlists", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Playlist> Sooloos.Broker.Api.PlaylistDuplicateCheckParameters::Playlists", "propType": 23 }],
  "Sooloos.Broker.Api.PlaylistInsertionParameters": [{ "shortName": "ExcludeDuplicates", "name": "bool Sooloos.Broker.Api.PlaylistInsertionParameters::ExcludeDuplicates", "propType": 2 }, { "shortName": "MediaIds", "name": "System.Collections.Generic.IList<long> Sooloos.Broker.Api.PlaylistInsertionParameters::MediaIds", "propType": 23 }, { "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.PlaylistInsertionParameters::Performers", "propType": 23 }, { "shortName": "Composers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.PlaylistInsertionParameters::Composers", "propType": 23 }, { "shortName": "Performances", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformanceBase> Sooloos.Broker.Api.PlaylistInsertionParameters::Performances", "propType": 23 }, { "shortName": "Playlists", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Playlist> Sooloos.Broker.Api.PlaylistInsertionParameters::Playlists", "propType": 23 }, { "shortName": "Profile", "name": "Sooloos.Broker.Api.Profile Sooloos.Broker.Api.PlaylistInsertionParameters::Profile", "propType": 23 }],
  "Sooloos.Broker.Api.MoveIfTranslatableOrCopyResult": [{ "shortName": "Playlist", "name": "Sooloos.Broker.Api.Playlist Sooloos.Broker.Api.MoveIfTranslatableOrCopyResult::Playlist", "propType": 23 }, { "shortName": "UntranslatedTracksCount", "name": "int Sooloos.Broker.Api.MoveIfTranslatableOrCopyResult::UntranslatedTracksCount", "propType": 0 }],
  "Sooloos.Broker.Api.MetadataLanguage": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.MetadataLanguage::Name", "propType": 20 }, { "shortName": "Native", "name": "string Sooloos.Broker.Api.MetadataLanguage::Native", "propType": 20 }, { "shortName": "Tag", "name": "string Sooloos.Broker.Api.MetadataLanguage::Tag", "propType": 20 }, { "shortName": "Scripts", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.MetadataLanguage::Scripts", "propType": 23 }],
  "Sooloos.Broker.Api.MetadataContentSource": [{ "shortName": "SourceName", "name": "string Sooloos.Broker.Api.MetadataContentSource::SourceName", "propType": 20 }, { "shortName": "LanguageName", "name": "string Sooloos.Broker.Api.MetadataContentSource::LanguageName", "propType": 20 }, { "shortName": "LanguageTag", "name": "string Sooloos.Broker.Api.MetadataContentSource::LanguageTag", "propType": 20 }, { "shortName": "DisplayName", "name": "string Sooloos.Broker.Api.MetadataContentSource::DisplayName", "propType": 20 }],
  "Sooloos.Broker.Api.MetadataSearchResult": [{ "shortName": "Albums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.MetadataSearchResult::Albums", "propType": 23 }],
  "Sooloos.Broker.Api.MatchingEdition": [{ "shortName": "AlbumEditionId", "name": "long? Sooloos.Broker.Api.MatchingEdition::AlbumEditionId", "propType": 11 }, { "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.MatchingEdition::Album", "propType": 23 }, { "shortName": "Tracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.MatchingEdition::Tracks", "propType": 23 }, { "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.MatchingEdition::Performers", "propType": 23 }, { "shortName": "Confidence", "name": "int Sooloos.Broker.Api.MatchingEdition::Confidence", "propType": 0 }, { "shortName": "ReleaseDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.MatchingEdition::ReleaseDate", "propType": 23 }, { "shortName": "ReleaseMediaFormat", "name": "Sooloos.Broker.Api.ReleaseMediaFormat? Sooloos.Broker.Api.MatchingEdition::ReleaseMediaFormat", "propType": 19 }, { "shortName": "ReleaseTitle", "name": "string Sooloos.Broker.Api.MatchingEdition::ReleaseTitle", "propType": 20 }, { "shortName": "ReleaseLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.MatchingEdition::ReleaseLabels", "propType": 23 }],
  "Sooloos.Broker.Api.AuxFileImageProperties": [{ "shortName": "Format", "name": "Sooloos.Broker.Api.ImageFormat Sooloos.Broker.Api.AuxFileImageProperties::Format", "propType": 9 }, { "shortName": "Width", "name": "int Sooloos.Broker.Api.AuxFileImageProperties::Width", "propType": 0 }, { "shortName": "Height", "name": "int Sooloos.Broker.Api.AuxFileImageProperties::Height", "propType": 0 }, { "shortName": "Bpp", "name": "int Sooloos.Broker.Api.AuxFileImageProperties::Bpp", "propType": 0 }, { "shortName": "Type", "name": "string Sooloos.Broker.Api.AuxFileImageProperties::Type", "propType": 20 }],
  "Sooloos.Broker.Api.AuxFileDocumentProperties": [{ "shortName": "Format", "name": "Sooloos.Broker.Api.DocumentFormat Sooloos.Broker.Api.AuxFileDocumentProperties::Format", "propType": 9 }],
  "Sooloos.Broker.Api.SkippedFile": [{ "shortName": "ContentLocation", "name": "Sooloos.Broker.Api.ContentLocation Sooloos.Broker.Api.SkippedFile::ContentLocation", "propType": 23 }, { "shortName": "Reason", "name": "string Sooloos.Broker.Api.SkippedFile::Reason", "propType": 20 }, { "shortName": "FileSize", "name": "long? Sooloos.Broker.Api.SkippedFile::FileSize", "propType": 11 }, { "shortName": "CreationTime", "name": "System.DateTime? Sooloos.Broker.Api.SkippedFile::CreationTime", "propType": 18 }, { "shortName": "ModificationTime", "name": "System.DateTime? Sooloos.Broker.Api.SkippedFile::ModificationTime", "propType": 18 }],
  "Sooloos.Broker.Api.DailyPicksBox": [{ "shortName": "ObjectId", "name": "System.Sooid Sooloos.Broker.Api.DailyPicksBox::ObjectId", "propType": 4 }, { "shortName": "OneBoxType", "name": "string Sooloos.Broker.Api.DailyPicksBox::OneBoxType", "propType": 20 }, { "shortName": "Reason", "name": "string Sooloos.Broker.Api.DailyPicksBox::Reason", "propType": 20 }, { "shortName": "ItemType", "name": "string Sooloos.Broker.Api.DailyPicksBox::ItemType", "propType": 20 }, { "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.DailyPicksBox::Albums", "propType": 23 }, { "shortName": "Performers", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.DailyPicksBox::Performers", "propType": 23 }, { "shortName": "Tracks", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.DailyPicksBox::Tracks", "propType": 23 }, { "shortName": "SeedAlbum", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.DailyPicksBox::SeedAlbum", "propType": 23 }, { "shortName": "SeedPerformer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.DailyPicksBox::SeedPerformer", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_Stub": [{ "shortName": "ObjectId", "name": "System.Sooid Sooloos.Broker.Api.OneBox_Stub::ObjectId", "propType": 4 }, { "shortName": "OneBoxType", "name": "string Sooloos.Broker.Api.OneBox_Stub::OneBoxType", "propType": 20 }, { "shortName": "Reason", "name": "string Sooloos.Broker.Api.OneBox_Stub::Reason", "propType": 20 }, { "shortName": "ItemType", "name": "string Sooloos.Broker.Api.OneBox_Stub::ItemType", "propType": 20 }, { "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.OneBox_Stub::Album", "propType": 23 }, { "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.OneBox_Stub::Performer", "propType": 23 }, { "shortName": "OneBox", "name": "object Sooloos.Broker.Api.OneBox_Stub::OneBox", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_HeydayAlbums": [{ "shortName": "StartYear", "name": "int Sooloos.Broker.Api.OneBox_HeydayAlbums::StartYear", "propType": 0 }, { "shortName": "EndYear", "name": "int Sooloos.Broker.Api.OneBox_HeydayAlbums::EndYear", "propType": 0 }, { "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumWithExtras> Sooloos.Broker.Api.OneBox_HeydayAlbums::Albums", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_MoreFromDateRange": [{ "shortName": "StartYear", "name": "int Sooloos.Broker.Api.OneBox_MoreFromDateRange::StartYear", "propType": 0 }, { "shortName": "EndYear", "name": "int Sooloos.Broker.Api.OneBox_MoreFromDateRange::EndYear", "propType": 0 }, { "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.OneBox_MoreFromDateRange::Albums", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_MoreFromGenre": [{ "shortName": "Genre", "name": "string Sooloos.Broker.Api.OneBox_MoreFromGenre::Genre", "propType": 20 }, { "shortName": "StartYear", "name": "int? Sooloos.Broker.Api.OneBox_MoreFromGenre::StartYear", "propType": 10 }, { "shortName": "EndYear", "name": "int? Sooloos.Broker.Api.OneBox_MoreFromGenre::EndYear", "propType": 10 }, { "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.OneBox_MoreFromGenre::Albums", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_WorksByForm": [{ "shortName": "Form", "name": "string Sooloos.Broker.Api.OneBox_WorksByForm::Form", "propType": 20 }, { "shortName": "Works", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.WorkLite> Sooloos.Broker.Api.OneBox_WorksByForm::Works", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_PerformerAlsoFrom": [{ "shortName": "Location", "name": "string Sooloos.Broker.Api.OneBox_PerformerAlsoFrom::Location", "propType": 20 }, { "shortName": "IsGroupsOnly", "name": "bool Sooloos.Broker.Api.OneBox_PerformerAlsoFrom::IsGroupsOnly", "propType": 2 }, { "shortName": "Performers", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.PerformerWithExtras> Sooloos.Broker.Api.OneBox_PerformerAlsoFrom::Performers", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_FeaturedCoveredPerformer": [{ "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.OneBox_FeaturedCoveredPerformer::Performer", "propType": 23 }, { "shortName": "Tracks", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.OneBox_FeaturedCoveredPerformer::Tracks", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_FeaturedCollaboration": [{ "shortName": "Performers", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.OneBox_FeaturedCollaboration::Performers", "propType": 23 }, { "shortName": "Tracks", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.OneBox_FeaturedCollaboration::Tracks", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_MoreFromCollaborators": [{ "shortName": "Performers", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.OneBox_MoreFromCollaborators::Performers", "propType": 23 }, { "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.OneBox_MoreFromCollaborators::Albums", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_GenreForYou": [{ "shortName": "Genre", "name": "Sooloos.Broker.Api.GenreLite Sooloos.Broker.Api.OneBox_GenreForYou::Genre", "propType": 23 }, { "shortName": "Performers", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.OneBox_GenreForYou::Performers", "propType": 23 }],
  "Sooloos.Broker.Api.OneBox_SimilarAlbums": [{ "shortName": "SimilarityType", "name": "string Sooloos.Broker.Api.OneBox_SimilarAlbums::SimilarityType", "propType": 20 }, { "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.OneBox_SimilarAlbums::Albums", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerWithExtras": [{ "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.PerformerWithExtras::Performer", "propType": 23 }, { "shortName": "Touchstones", "name": "Sooloos.Broker.Api.DataList<string> Sooloos.Broker.Api.PerformerWithExtras::Touchstones", "propType": 23 }, { "shortName": "Biography", "name": "Sooloos.Broker.Api.Biography Sooloos.Broker.Api.PerformerWithExtras::Biography", "propType": 23 }, { "shortName": "Tracks", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.PerformerWithExtras::Tracks", "propType": 23 }, { "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.PerformerWithExtras::Albums", "propType": 23 }, { "shortName": "Works", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.WorkLite> Sooloos.Broker.Api.PerformerWithExtras::Works", "propType": 23 }],
  "Sooloos.Broker.Api.AlbumWithExtras": [{ "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.AlbumWithExtras::Album", "propType": 23 }, { "shortName": "Review", "name": "Sooloos.Broker.Api.Review Sooloos.Broker.Api.AlbumWithExtras::Review", "propType": 23 }, { "shortName": "AlbumId", "name": "long Sooloos.Broker.Api.AlbumWithExtras::AlbumId", "propType": 1 }],
  "Sooloos.Broker.Api.PerformerRecommendedAlbums": [{ "shortName": "RecommendedAlbums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.PerformerRecommendedAlbums::RecommendedAlbums", "propType": 23 }, { "shortName": "LatestAlbums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.PerformerRecommendedAlbums::LatestAlbums", "propType": 23 }, { "shortName": "AppearsOnAlbums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.PerformerRecommendedAlbums::AppearsOnAlbums", "propType": 23 }, { "shortName": "IsComposer", "name": "bool Sooloos.Broker.Api.PerformerRecommendedAlbums::IsComposer", "propType": 2 }],
  "Sooloos.Broker.Api.TimelineAlbums": [{ "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.TimelineAlbums::Albums", "propType": 23 }, { "shortName": "IsFallback", "name": "bool Sooloos.Broker.Api.TimelineAlbums::IsFallback", "propType": 2 }],
  "Sooloos.Broker.Api.AlbumMoreFromArtist": [{ "shortName": "Timeline", "name": "Sooloos.Broker.Api.TimelineAlbums Sooloos.Broker.Api.AlbumMoreFromArtist::Timeline", "propType": 23 }, { "shortName": "InLibrary", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.AlbumMoreFromArtist::InLibrary", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerTopTracks": [{ "shortName": "Popular", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.PerformerTopTracks::Popular", "propType": 23 }, { "shortName": "InLibrary", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.PerformerTopTracks::InLibrary", "propType": 23 }],
  "Sooloos.Broker.Api.TagItemQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.TagItemOrdering Sooloos.Broker.Api.TagItemQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.TagItemQueryOrdering::Direction", "propType": 9 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.TagItemQueryOrdering::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.TagItemQueryOrdering::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "AlbumDatePreference", "name": "Sooloos.Broker.Api.AlbumDatePreference Sooloos.Broker.Api.TagItemQueryOrdering::AlbumDatePreference", "propType": 9 }, { "shortName": "VariousArtistsSortKey", "name": "string Sooloos.Broker.Api.TagItemQueryOrdering::VariousArtistsSortKey", "propType": 20 }],
  "Sooloos.Broker.Api.TagItemQueryCriteria": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.TagItemQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TagItemQueryCriteria::LanguagePreferences", "propType": 23 }, { "shortName": "Ordering", "name": "Sooloos.Broker.Api.TagItemQueryOrdering Sooloos.Broker.Api.TagItemQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.TagItemQueryCriteria::TextFilter", "propType": 20 }],
  "Sooloos.Broker.Api.SmartTagCriteria": [{ "shortName": "AlbumCriteria", "name": "Sooloos.Broker.Api.AlbumQueryCriteria Sooloos.Broker.Api.SmartTagCriteria::AlbumCriteria", "propType": 23 }, { "shortName": "TrackCriteria", "name": "Sooloos.Broker.Api.TrackQueryCriteria Sooloos.Broker.Api.SmartTagCriteria::TrackCriteria", "propType": 23 }, { "shortName": "PerformerCriteria", "name": "Sooloos.Broker.Api.PerformerQueryCriteria Sooloos.Broker.Api.SmartTagCriteria::PerformerCriteria", "propType": 23 }, { "shortName": "WorkCriteria", "name": "Sooloos.Broker.Api.WorkQueryCriteria Sooloos.Broker.Api.SmartTagCriteria::WorkCriteria", "propType": 23 }, { "shortName": "ComposerCriteria", "name": "Sooloos.Broker.Api.PerformerQueryCriteria Sooloos.Broker.Api.SmartTagCriteria::ComposerCriteria", "propType": 23 }],
  "Sooloos.Broker.Api.EditTagParameters": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.EditTagParameters::Name", "propType": 20 }, { "shortName": "AllowDuplicateName", "name": "bool Sooloos.Broker.Api.EditTagParameters::AllowDuplicateName", "propType": 2 }, { "shortName": "ClearProfile", "name": "bool Sooloos.Broker.Api.EditTagParameters::ClearProfile", "propType": 2 }, { "shortName": "Profile", "name": "Sooloos.Broker.Api.Profile Sooloos.Broker.Api.EditTagParameters::Profile", "propType": 23 }, { "shortName": "ClearDescription", "name": "bool Sooloos.Broker.Api.EditTagParameters::ClearDescription", "propType": 2 }, { "shortName": "Description", "name": "string Sooloos.Broker.Api.EditTagParameters::Description", "propType": 20 }, { "shortName": "ClearImage", "name": "bool Sooloos.Broker.Api.EditTagParameters::ClearImage", "propType": 2 }, { "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.EditTagParameters::Image", "propType": 23 }, { "shortName": "EditSmartTag", "name": "Sooloos.Broker.Api.EditSmartTagParameters Sooloos.Broker.Api.EditTagParameters::EditSmartTag", "propType": 23 }, { "shortName": "EditExplicitTag", "name": "Sooloos.Broker.Api.EditExplicitTagParameters Sooloos.Broker.Api.EditTagParameters::EditExplicitTag", "propType": 23 }],
  "Sooloos.Broker.Api.EditSmartTagParameters": [{ "shortName": "Criteria", "name": "Sooloos.Broker.Api.SmartTagCriteria Sooloos.Broker.Api.EditSmartTagParameters::Criteria", "propType": 23 }],
  "Sooloos.Broker.Api.EditExplicitTagParameters": [{ "shortName": "ClearAlbums", "name": "bool Sooloos.Broker.Api.EditExplicitTagParameters::ClearAlbums", "propType": 2 }, { "shortName": "RemoveAlbums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumBase> Sooloos.Broker.Api.EditExplicitTagParameters::RemoveAlbums", "propType": 23 }, { "shortName": "AddAlbums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumBase> Sooloos.Broker.Api.EditExplicitTagParameters::AddAlbums", "propType": 23 }, { "shortName": "ClearTracks", "name": "bool Sooloos.Broker.Api.EditExplicitTagParameters::ClearTracks", "propType": 2 }, { "shortName": "AddTracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackBase> Sooloos.Broker.Api.EditExplicitTagParameters::AddTracks", "propType": 23 }, { "shortName": "RemoveTracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackBase> Sooloos.Broker.Api.EditExplicitTagParameters::RemoveTracks", "propType": 23 }, { "shortName": "ClearWorks", "name": "bool Sooloos.Broker.Api.EditExplicitTagParameters::ClearWorks", "propType": 2 }, { "shortName": "AddWorks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkBase> Sooloos.Broker.Api.EditExplicitTagParameters::AddWorks", "propType": 23 }, { "shortName": "RemoveWorks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkBase> Sooloos.Broker.Api.EditExplicitTagParameters::RemoveWorks", "propType": 23 }, { "shortName": "ClearPerformers", "name": "bool Sooloos.Broker.Api.EditExplicitTagParameters::ClearPerformers", "propType": 2 }, { "shortName": "AddPerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.EditExplicitTagParameters::AddPerformers", "propType": 23 }, { "shortName": "RemovePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.EditExplicitTagParameters::RemovePerformers", "propType": 23 }, { "shortName": "ClearComposers", "name": "bool Sooloos.Broker.Api.EditExplicitTagParameters::ClearComposers", "propType": 2 }, { "shortName": "AddComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.EditExplicitTagParameters::AddComposers", "propType": 23 }, { "shortName": "RemoveComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.EditExplicitTagParameters::RemoveComposers", "propType": 23 }, { "shortName": "ClearGenres", "name": "bool Sooloos.Broker.Api.EditExplicitTagParameters::ClearGenres", "propType": 2 }, { "shortName": "AddGenres", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.EditExplicitTagParameters::AddGenres", "propType": 23 }, { "shortName": "RemoveGenres", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.EditExplicitTagParameters::RemoveGenres", "propType": 23 }, { "shortName": "ClearPlaylists", "name": "bool Sooloos.Broker.Api.EditExplicitTagParameters::ClearPlaylists", "propType": 2 }, { "shortName": "AddPlaylists", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Playlist> Sooloos.Broker.Api.EditExplicitTagParameters::AddPlaylists", "propType": 23 }, { "shortName": "RemovePlaylists", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Playlist> Sooloos.Broker.Api.EditExplicitTagParameters::RemovePlaylists", "propType": 23 }, { "shortName": "ClearTags", "name": "bool Sooloos.Broker.Api.EditExplicitTagParameters::ClearTags", "propType": 2 }, { "shortName": "AddTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagBase> Sooloos.Broker.Api.EditExplicitTagParameters::AddTags", "propType": 23 }, { "shortName": "RemoveTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagBase> Sooloos.Broker.Api.EditExplicitTagParameters::RemoveTags", "propType": 23 }],
  "Sooloos.Broker.Api.CreateTagParameters": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.CreateTagParameters::Name", "propType": 20 }, { "shortName": "Description", "name": "string Sooloos.Broker.Api.CreateTagParameters::Description", "propType": 20 }, { "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.CreateTagParameters::Image", "propType": 23 }, { "shortName": "Profile", "name": "Sooloos.Broker.Api.Profile Sooloos.Broker.Api.CreateTagParameters::Profile", "propType": 23 }, { "shortName": "AllowDuplicateName", "name": "bool Sooloos.Broker.Api.CreateTagParameters::AllowDuplicateName", "propType": 2 }, { "shortName": "Criteria", "name": "Sooloos.Broker.Api.SmartTagCriteria Sooloos.Broker.Api.CreateTagParameters::Criteria", "propType": 23 }, { "shortName": "TagId", "name": "System.Sooid? Sooloos.Broker.Api.CreateTagParameters::TagId", "propType": 14 }],
  "Sooloos.Broker.Api.CreateTagResult": [{ "shortName": "NewTag", "name": "Sooloos.Broker.Api.TagLite Sooloos.Broker.Api.CreateTagResult::NewTag", "propType": 23 }, { "shortName": "DuplicatedTag", "name": "Sooloos.Broker.Api.TagLite Sooloos.Broker.Api.CreateTagResult::DuplicatedTag", "propType": 23 }],
  "Sooloos.Broker.Api.EditTagResult": [{ "shortName": "DuplicatedTag", "name": "Sooloos.Broker.Api.TagLite Sooloos.Broker.Api.EditTagResult::DuplicatedTag", "propType": 23 }],
  "Sooloos.Broker.Api.AlbumEditInfoParameters": [{ "shortName": "Albums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumBase> Sooloos.Broker.Api.AlbumEditInfoParameters::Albums", "propType": 23 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumEditInfoParameters::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerEditInfoParameters": [{ "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.PerformerEditInfoParameters::Performers", "propType": 23 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerEditInfoParameters::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerMappingInfo": [{ "shortName": "SourcePerformer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.PerformerMappingInfo::SourcePerformer", "propType": 23 }, { "shortName": "TargetPerformer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.PerformerMappingInfo::TargetPerformer", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerMapping": [{ "shortName": "SourcePerformer", "name": "Sooloos.Broker.Api.PerformerBase Sooloos.Broker.Api.PerformerMapping::SourcePerformer", "propType": 23 }, { "shortName": "TargetPerformer", "name": "Sooloos.Broker.Api.PerformerBase Sooloos.Broker.Api.PerformerMapping::TargetPerformer", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerMappingEditInfo": [{ "shortName": "Mappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerMappingInfo> Sooloos.Broker.Api.PerformerMappingEditInfo::Mappings", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerMappingEdit": [{ "shortName": "RemoveMappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerBase> Sooloos.Broker.Api.PerformerMappingEdit::RemoveMappings", "propType": 23 }, { "shortName": "AddMappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerMapping> Sooloos.Broker.Api.PerformerMappingEdit::AddMappings", "propType": 23 }],
  "Sooloos.Broker.Api.WorkMappingInfo": [{ "shortName": "SourceWork", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.WorkMappingInfo::SourceWork", "propType": 23 }, { "shortName": "TargetWork", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.WorkMappingInfo::TargetWork", "propType": 23 }],
  "Sooloos.Broker.Api.WorkMapping": [{ "shortName": "SourceWork", "name": "Sooloos.Broker.Api.WorkBase Sooloos.Broker.Api.WorkMapping::SourceWork", "propType": 23 }, { "shortName": "TargetWork", "name": "Sooloos.Broker.Api.WorkBase Sooloos.Broker.Api.WorkMapping::TargetWork", "propType": 23 }],
  "Sooloos.Broker.Api.WorkMappingEditInfo": [{ "shortName": "Mappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkMappingInfo> Sooloos.Broker.Api.WorkMappingEditInfo::Mappings", "propType": 23 }],
  "Sooloos.Broker.Api.WorkMappingEdit": [{ "shortName": "RemoveMappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkBase> Sooloos.Broker.Api.WorkMappingEdit::RemoveMappings", "propType": 23 }, { "shortName": "AddMappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkMapping> Sooloos.Broker.Api.WorkMappingEdit::AddMappings", "propType": 23 }],
  "Sooloos.Broker.Api.GenreMappingInfo": [{ "shortName": "LocalGenre", "name": "Sooloos.Broker.Api.GenreLite Sooloos.Broker.Api.GenreMappingInfo::LocalGenre", "propType": 23 }, { "shortName": "Genre", "name": "Sooloos.Broker.Api.GenreLite Sooloos.Broker.Api.GenreMappingInfo::Genre", "propType": 23 }, { "shortName": "IsEdited", "name": "bool Sooloos.Broker.Api.GenreMappingInfo::IsEdited", "propType": 2 }],
  "Sooloos.Broker.Api.GenreMapping": [{ "shortName": "LocalGenre", "name": "string Sooloos.Broker.Api.GenreMapping::LocalGenre", "propType": 20 }, { "shortName": "Genre", "name": "string Sooloos.Broker.Api.GenreMapping::Genre", "propType": 20 }],
  "Sooloos.Broker.Api.GenreMappingEditInfo": [{ "shortName": "Mappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreMappingInfo> Sooloos.Broker.Api.GenreMappingEditInfo::Mappings", "propType": 23 }],
  "Sooloos.Broker.Api.GenreMappingEdit": [{ "shortName": "AddMappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreMapping> Sooloos.Broker.Api.GenreMappingEdit::AddMappings", "propType": 23 }, { "shortName": "RemoveMappings", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreMapping> Sooloos.Broker.Api.GenreMappingEdit::RemoveMappings", "propType": 23 }],
  "Sooloos.Broker.Api.LibraryEdit": [{ "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerEdit> Sooloos.Broker.Api.LibraryEdit::Performers", "propType": 23 }, { "shortName": "Albums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumEdit> Sooloos.Broker.Api.LibraryEdit::Albums", "propType": 24 }, { "shortName": "Tracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackEdit> Sooloos.Broker.Api.LibraryEdit::Tracks", "propType": 23 }, { "shortName": "Works", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkEdit> Sooloos.Broker.Api.LibraryEdit::Works", "propType": 23 }, { "shortName": "Performances", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformanceEdit> Sooloos.Broker.Api.LibraryEdit::Performances", "propType": 23 }, { "shortName": "Genres", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreEdit> Sooloos.Broker.Api.LibraryEdit::Genres", "propType": 23 }],
  "Sooloos.Broker.Api.GenreEditInfo": [{ "shortName": "Genre", "name": "Sooloos.Broker.Api.GenreLite Sooloos.Broker.Api.GenreEditInfo::Genre", "propType": 23 }, { "shortName": "Parent", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.GenreEditInfo::Parent", "propType": 23 }, { "shortName": "Description", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.GenreEditInfo::Description", "propType": 23 }],
  "Sooloos.Broker.Api.GenreEdit": [{ "shortName": "Genre", "name": "string Sooloos.Broker.Api.GenreEdit::Genre", "propType": 20 }, { "shortName": "Parent", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.GenreEdit::Parent", "propType": 23 }, { "shortName": "Description", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.GenreEdit::Description", "propType": 23 }, { "shortName": "ClearMetadataEdits", "name": "bool Sooloos.Broker.Api.GenreEdit::ClearMetadataEdits", "propType": 2 }],
  "Sooloos.Broker.Api.WorkEditInfo": [{ "shortName": "Work", "name": "Sooloos.Broker.Api.WorkLite Sooloos.Broker.Api.WorkEditInfo::Work", "propType": 23 }, { "shortName": "Composers", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.WorkEditInfo::Composers", "propType": 23 }, { "shortName": "Title", "name": "Sooloos.Broker.Api.EditRequiredRefInfo<string> Sooloos.Broker.Api.WorkEditInfo::Title", "propType": 23 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.WorkEditInfo::Type", "propType": 23 }, { "shortName": "Period", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.WorkEditInfo::Period", "propType": 23 }, { "shortName": "Form", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.WorkEditInfo::Form", "propType": 23 }, { "shortName": "CompositionStartDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.WorkEditInfo::CompositionStartDate", "propType": 23 }, { "shortName": "CompositionEndDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.WorkEditInfo::CompositionEndDate", "propType": 23 }, { "shortName": "Description", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.Broker.Api.Description> Sooloos.Broker.Api.WorkEditInfo::Description", "propType": 23 }, { "shortName": "CatalogNumbers", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.CatalogNumber> Sooloos.Broker.Api.WorkEditInfo::CatalogNumbers", "propType": 23 }, { "shortName": "Instrumentation", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.Broker.Api.Instrumentation> Sooloos.Broker.Api.WorkEditInfo::Instrumentation", "propType": 23 }],
  "Sooloos.Broker.Api.WorkEdit": [{ "shortName": "WorkId", "name": "long Sooloos.Broker.Api.WorkEdit::WorkId", "propType": 1 }, { "shortName": "Composers", "name": "Sooloos.Broker.Api.EditList<long> Sooloos.Broker.Api.WorkEdit::Composers", "propType": 23 }, { "shortName": "Title", "name": "Sooloos.Broker.Api.EditRequiredRef<string> Sooloos.Broker.Api.WorkEdit::Title", "propType": 23 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.WorkEdit::Type", "propType": 23 }, { "shortName": "Period", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.WorkEdit::Period", "propType": 23 }, { "shortName": "Form", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.WorkEdit::Form", "propType": 23 }, { "shortName": "CompositionStartDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.WorkEdit::CompositionStartDate", "propType": 23 }, { "shortName": "CompositionEndDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.WorkEdit::CompositionEndDate", "propType": 23 }, { "shortName": "Description", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.Broker.Api.Description> Sooloos.Broker.Api.WorkEdit::Description", "propType": 23 }, { "shortName": "CatalogNumbers", "name": "Sooloos.Broker.Api.EditList<Sooloos.Broker.Api.CatalogNumber> Sooloos.Broker.Api.WorkEdit::CatalogNumbers", "propType": 23 }, { "shortName": "Instrumentation", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.Broker.Api.Instrumentation> Sooloos.Broker.Api.WorkEdit::Instrumentation", "propType": 23 }, { "shortName": "ClearMetadataEdits", "name": "bool Sooloos.Broker.Api.WorkEdit::ClearMetadataEdits", "propType": 2 }],
  "Sooloos.Broker.Api.PerformanceEditInfo": [{ "shortName": "Performance", "name": "Sooloos.Broker.Api.PerformanceLite Sooloos.Broker.Api.PerformanceEditInfo::Performance", "propType": 23 }, { "shortName": "Work", "name": "Sooloos.Broker.Api.EditRequiredRefInfo<Sooloos.Broker.Api.WorkLite> Sooloos.Broker.Api.PerformanceEditInfo::Work", "propType": 23 }],
  "Sooloos.Broker.Api.PerformanceEdit": [{ "shortName": "PerformanceId", "name": "long Sooloos.Broker.Api.PerformanceEdit::PerformanceId", "propType": 1 }, { "shortName": "Work", "name": "Sooloos.Broker.Api.EditRequiredVal<long> Sooloos.Broker.Api.PerformanceEdit::Work", "propType": 23 }, { "shortName": "ClearMetadataEdits", "name": "bool Sooloos.Broker.Api.PerformanceEdit::ClearMetadataEdits", "propType": 2 }],
  "Sooloos.Broker.Api.TrackEditInfo": [{ "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.TrackEditInfo::Track", "propType": 23 }, { "shortName": "AlbumId", "name": "Sooloos.Broker.Api.EditRequiredValInfo<long> Sooloos.Broker.Api.TrackEditInfo::AlbumId", "propType": 23 }, { "shortName": "MetadataTrackId", "name": "Sooloos.Broker.Api.EditOptionalValInfo<long> Sooloos.Broker.Api.TrackEditInfo::MetadataTrackId", "propType": 23 }, { "shortName": "Performance", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.Broker.Api.PerformanceLite> Sooloos.Broker.Api.TrackEditInfo::Performance", "propType": 23 }, { "shortName": "Title", "name": "Sooloos.Broker.Api.EditRequiredRefInfo<string> Sooloos.Broker.Api.TrackEditInfo::Title", "propType": 23 }, { "shortName": "TrackNumber", "name": "Sooloos.Broker.Api.EditRequiredValInfo<int> Sooloos.Broker.Api.TrackEditInfo::TrackNumber", "propType": 23 }, { "shortName": "MediaNumber", "name": "Sooloos.Broker.Api.EditRequiredValInfo<int> Sooloos.Broker.Api.TrackEditInfo::MediaNumber", "propType": 23 }, { "shortName": "IsPick", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.TrackEditInfo::IsPick", "propType": 23 }, { "shortName": "ContainsExplicitContent", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.TrackEditInfo::ContainsExplicitContent", "propType": 23 }, { "shortName": "Credits", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.Credit> Sooloos.Broker.Api.TrackEditInfo::Credits", "propType": 23 }, { "shortName": "ImportDate", "name": "Sooloos.Broker.Api.EditRequiredValInfo<System.DateTime> Sooloos.Broker.Api.TrackEditInfo::ImportDate", "propType": 23 }, { "shortName": "IsUserHidden", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.TrackEditInfo::IsUserHidden", "propType": 23 }, { "shortName": "IsLive", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.TrackEditInfo::IsLive", "propType": 23 }, { "shortName": "PerformanceLocation", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.TrackEditInfo::PerformanceLocation", "propType": 23 }, { "shortName": "PerformanceStartDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.TrackEditInfo::PerformanceStartDate", "propType": 23 }, { "shortName": "PerformanceEndDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.TrackEditInfo::PerformanceEndDate", "propType": 23 }, { "shortName": "FileCreationTime", "name": "System.DateTime? Sooloos.Broker.Api.TrackEditInfo::FileCreationTime", "propType": 18 }, { "shortName": "FileModificationTime", "name": "System.DateTime? Sooloos.Broker.Api.TrackEditInfo::FileModificationTime", "propType": 18 }],
  "Sooloos.Broker.Api.TrackEdit": [{ "shortName": "TracksFromAlbumId", "name": "long? Sooloos.Broker.Api.TrackEdit::TracksFromAlbumId", "propType": 11 }, { "shortName": "TrackId", "name": "long Sooloos.Broker.Api.TrackEdit::TrackId", "propType": 1 }, { "shortName": "AlbumId", "name": "Sooloos.Broker.Api.EditRequiredVal<long> Sooloos.Broker.Api.TrackEdit::AlbumId", "propType": 23 }, { "shortName": "MetadataTrackId", "name": "Sooloos.Broker.Api.EditOptionalVal<long> Sooloos.Broker.Api.TrackEdit::MetadataTrackId", "propType": 23 }, { "shortName": "Performance", "name": "Sooloos.Broker.Api.EditOptionalVal<long> Sooloos.Broker.Api.TrackEdit::Performance", "propType": 23 }, { "shortName": "Title", "name": "Sooloos.Broker.Api.EditRequiredRef<string> Sooloos.Broker.Api.TrackEdit::Title", "propType": 23 }, { "shortName": "TrackNumber", "name": "Sooloos.Broker.Api.EditRequiredVal<int> Sooloos.Broker.Api.TrackEdit::TrackNumber", "propType": 23 }, { "shortName": "MediaNumber", "name": "Sooloos.Broker.Api.EditRequiredVal<int> Sooloos.Broker.Api.TrackEdit::MediaNumber", "propType": 23 }, { "shortName": "ImportDate", "name": "Sooloos.Broker.Api.EditRequiredVal<System.DateTime> Sooloos.Broker.Api.TrackEdit::ImportDate", "propType": 23 }, { "shortName": "IsPick", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.TrackEdit::IsPick", "propType": 23 }, { "shortName": "ContainsExplicitContent", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.TrackEdit::ContainsExplicitContent", "propType": 23 }, { "shortName": "Credits", "name": "Sooloos.Broker.Api.EditList<Sooloos.Broker.Api.CreditEdit> Sooloos.Broker.Api.TrackEdit::Credits", "propType": 23 }, { "shortName": "IsUserHidden", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.TrackEdit::IsUserHidden", "propType": 23 }, { "shortName": "IsLive", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.TrackEdit::IsLive", "propType": 23 }, { "shortName": "PerformanceLocation", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.TrackEdit::PerformanceLocation", "propType": 23 }, { "shortName": "PerformanceStartDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.TrackEdit::PerformanceStartDate", "propType": 23 }, { "shortName": "PerformanceEndDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.TrackEdit::PerformanceEndDate", "propType": 23 }, { "shortName": "ClearMetadataEdits", "name": "bool Sooloos.Broker.Api.TrackEdit::ClearMetadataEdits", "propType": 2 }, { "shortName": "SetImportDateToFileModificationTime", "name": "bool Sooloos.Broker.Api.TrackEdit::SetImportDateToFileModificationTime", "propType": 2 }, { "shortName": "SetImportDateToFileCreationTime", "name": "bool Sooloos.Broker.Api.TrackEdit::SetImportDateToFileCreationTime", "propType": 2 }],
  "Sooloos.Broker.Api.AlbumRelationship": [{ "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.AlbumRelationship::Album", "propType": 23 }, { "shortName": "RelationshipType", "name": "Sooloos.Broker.Api.AlbumRelationshipType Sooloos.Broker.Api.AlbumRelationship::RelationshipType", "propType": 9 }],
  "Sooloos.Broker.Api.AlbumRelationshipEdit": [{ "shortName": "Album", "name": "long Sooloos.Broker.Api.AlbumRelationshipEdit::Album", "propType": 1 }, { "shortName": "RelationshipType", "name": "Sooloos.Broker.Api.AlbumRelationshipType Sooloos.Broker.Api.AlbumRelationshipEdit::RelationshipType", "propType": 9 }],
  "Sooloos.Broker.Api.AlbumEditInfo": [{ "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.AlbumEditInfo::Album", "propType": 23 }, { "shortName": "MetadataAlbumId", "name": "Sooloos.Broker.Api.EditOptionalValInfo<long> Sooloos.Broker.Api.AlbumEditInfo::MetadataAlbumId", "propType": 23 }, { "shortName": "Title", "name": "Sooloos.Broker.Api.EditRequiredRefInfo<string> Sooloos.Broker.Api.AlbumEditInfo::Title", "propType": 23 }, { "shortName": "OriginalReleaseDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.AlbumEditInfo::OriginalReleaseDate", "propType": 23 }, { "shortName": "RecordingStartDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.AlbumEditInfo::RecordingStartDate", "propType": 23 }, { "shortName": "RecordingEndDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.AlbumEditInfo::RecordingEndDate", "propType": 23 }, { "shortName": "ReleaseDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.AlbumEditInfo::ReleaseDate", "propType": 23 }, { "shortName": "MainPerformers", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumEditInfo::MainPerformers", "propType": 23 }, { "shortName": "PerformedBy", "name": "Sooloos.Broker.Api.EditRequiredRefInfo<string> Sooloos.Broker.Api.AlbumEditInfo::PerformedBy", "propType": 23 }, { "shortName": "Credits", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.Credit> Sooloos.Broker.Api.AlbumEditInfo::Credits", "propType": 23 }, { "shortName": "ContainsExplicitContent", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.AlbumEditInfo::ContainsExplicitContent", "propType": 23 }, { "shortName": "IsCompilation", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.AlbumEditInfo::IsCompilation", "propType": 23 }, { "shortName": "IsLive", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.AlbumEditInfo::IsLive", "propType": 23 }, { "shortName": "IsBootleg", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.AlbumEditInfo::IsBootleg", "propType": 23 }, { "shortName": "IsPick", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.AlbumEditInfo::IsPick", "propType": 23 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.EditOptionalValInfo<Sooloos.Broker.Api.AlbumType> Sooloos.Broker.Api.AlbumEditInfo::Type", "propType": 23 }, { "shortName": "Rating", "name": "Sooloos.Broker.Api.EditOptionalValInfo<int> Sooloos.Broker.Api.AlbumEditInfo::Rating", "propType": 23 }, { "shortName": "Genres", "name": "Sooloos.Broker.Api.EditListInfo<string> Sooloos.Broker.Api.AlbumEditInfo::Genres", "propType": 23 }, { "shortName": "Labels", "name": "Sooloos.Broker.Api.EditListInfo<string> Sooloos.Broker.Api.AlbumEditInfo::Labels", "propType": 23 }, { "shortName": "Images", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.AlbumEditInfo::Images", "propType": 23 }, { "shortName": "MainImage", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.AlbumEditInfo::MainImage", "propType": 23 }, { "shortName": "Relationships", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.AlbumRelationship> Sooloos.Broker.Api.AlbumEditInfo::Relationships", "propType": 23 }, { "shortName": "IsUserHidden", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.AlbumEditInfo::IsUserHidden", "propType": 23 }, { "shortName": "Version", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.AlbumEditInfo::Version", "propType": 23 }, { "shortName": "DuplicateOf", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.AlbumEditInfo::DuplicateOf", "propType": 23 }, { "shortName": "Country", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.AlbumEditInfo::Country", "propType": 23 }, { "shortName": "CatalogNumber", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.AlbumEditInfo::CatalogNumber", "propType": 23 }, { "shortName": "ProductCode", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.AlbumEditInfo::ProductCode", "propType": 23 }, { "shortName": "PerformanceGrouping", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.Broker.Api.PerformanceGrouping> Sooloos.Broker.Api.AlbumEditInfo::PerformanceGrouping", "propType": 23 }],
  "Sooloos.Broker.Api.PerformanceGrouping": [{ "shortName": "TrackCount", "name": "int Sooloos.Broker.Api.PerformanceGrouping::TrackCount", "propType": 0 }, { "shortName": "PerformanceCount", "name": "int Sooloos.Broker.Api.PerformanceGrouping::PerformanceCount", "propType": 0 }],
  "Sooloos.Broker.Api.AlbumEdit": [{ "shortName": "AlbumId", "name": "long Sooloos.Broker.Api.AlbumEdit::AlbumId", "propType": 1 }, { "shortName": "MetadataAlbumId", "name": "Sooloos.Broker.Api.EditOptionalVal<long> Sooloos.Broker.Api.AlbumEdit::MetadataAlbumId", "propType": 23 }, { "shortName": "Title", "name": "Sooloos.Broker.Api.EditRequiredRef<string> Sooloos.Broker.Api.AlbumEdit::Title", "propType": 23 }, { "shortName": "OriginalReleaseDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.AlbumEdit::OriginalReleaseDate", "propType": 23 }, { "shortName": "ReleaseDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.AlbumEdit::ReleaseDate", "propType": 23 }, { "shortName": "RecordingStartDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.AlbumEdit::RecordingStartDate", "propType": 23 }, { "shortName": "RecordingEndDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.AlbumEdit::RecordingEndDate", "propType": 23 }, { "shortName": "MainPerformers", "name": "Sooloos.Broker.Api.EditList<long> Sooloos.Broker.Api.AlbumEdit::MainPerformers", "propType": 23 }, { "shortName": "PerformedBy", "name": "Sooloos.Broker.Api.EditRequiredRef<string> Sooloos.Broker.Api.AlbumEdit::PerformedBy", "propType": 23 }, { "shortName": "Credits", "name": "Sooloos.Broker.Api.EditList<Sooloos.Broker.Api.CreditEdit> Sooloos.Broker.Api.AlbumEdit::Credits", "propType": 23 }, { "shortName": "ContainsExplicitContent", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.AlbumEdit::ContainsExplicitContent", "propType": 23 }, { "shortName": "IsCompilation", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.AlbumEdit::IsCompilation", "propType": 23 }, { "shortName": "IsLive", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.AlbumEdit::IsLive", "propType": 23 }, { "shortName": "IsBootleg", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.AlbumEdit::IsBootleg", "propType": 23 }, { "shortName": "IsPick", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.AlbumEdit::IsPick", "propType": 23 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.EditOptionalVal<Sooloos.Broker.Api.AlbumType> Sooloos.Broker.Api.AlbumEdit::Type", "propType": 23 }, { "shortName": "Rating", "name": "Sooloos.Broker.Api.EditOptionalVal<int> Sooloos.Broker.Api.AlbumEdit::Rating", "propType": 23 }, { "shortName": "Genres", "name": "Sooloos.Broker.Api.EditList<string> Sooloos.Broker.Api.AlbumEdit::Genres", "propType": 23 }, { "shortName": "Labels", "name": "Sooloos.Broker.Api.EditList<string> Sooloos.Broker.Api.AlbumEdit::Labels", "propType": 23 }, { "shortName": "Images", "name": "Sooloos.Broker.Api.EditList<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.AlbumEdit::Images", "propType": 23 }, { "shortName": "MainImage", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.AlbumEdit::MainImage", "propType": 23 }, { "shortName": "Relationships", "name": "Sooloos.Broker.Api.EditList<Sooloos.Broker.Api.AlbumRelationshipEdit> Sooloos.Broker.Api.AlbumEdit::Relationships", "propType": 23 }, { "shortName": "IsUserHidden", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.AlbumEdit::IsUserHidden", "propType": 23 }, { "shortName": "Version", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.AlbumEdit::Version", "propType": 23 }, { "shortName": "DuplicateOf", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.AlbumEdit::DuplicateOf", "propType": 23 }, { "shortName": "Country", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.AlbumEdit::Country", "propType": 23 }, { "shortName": "CatalogNumber", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.AlbumEdit::CatalogNumber", "propType": 23 }, { "shortName": "ProductCode", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.AlbumEdit::ProductCode", "propType": 23 }, { "shortName": "PerformanceGrouping", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.Broker.Api.PerformanceGrouping> Sooloos.Broker.Api.AlbumEdit::PerformanceGrouping", "propType": 23 }, { "shortName": "ClearMetadataEdits", "name": "bool Sooloos.Broker.Api.AlbumEdit::ClearMetadataEdits", "propType": 2 }],
  "Sooloos.Broker.Api.CreditEdit": [{ "shortName": "Performer", "name": "long Sooloos.Broker.Api.CreditEdit::Performer", "propType": 1 }, { "shortName": "Role", "name": "string Sooloos.Broker.Api.CreditEdit::Role", "propType": 20 }],
  "Sooloos.Broker.Api.PerformerRelationship": [{ "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.PerformerRelationship::Performer", "propType": 23 }, { "shortName": "RelationshipType", "name": "Sooloos.Broker.Api.PerformerRelationshipType Sooloos.Broker.Api.PerformerRelationship::RelationshipType", "propType": 9 }],
  "Sooloos.Broker.Api.PerformerRelationshipEdit": [{ "shortName": "Performer", "name": "long Sooloos.Broker.Api.PerformerRelationshipEdit::Performer", "propType": 1 }, { "shortName": "RelationshipType", "name": "Sooloos.Broker.Api.PerformerRelationshipType Sooloos.Broker.Api.PerformerRelationshipEdit::RelationshipType", "propType": 9 }],
  "Sooloos.Broker.Api.PerformerEditInfo": [{ "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.PerformerEditInfo::Performer", "propType": 23 }, { "shortName": "IsClassicalComposer", "name": "Sooloos.Broker.Api.EditOptionalValInfo<bool> Sooloos.Broker.Api.PerformerEditInfo::IsClassicalComposer", "propType": 23 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.EditOptionalValInfo<Sooloos.Broker.Api.PerformerType> Sooloos.Broker.Api.PerformerEditInfo::Type", "propType": 23 }, { "shortName": "Rating", "name": "Sooloos.Broker.Api.EditOptionalValInfo<int> Sooloos.Broker.Api.PerformerEditInfo::Rating", "propType": 23 }, { "shortName": "Name", "name": "Sooloos.Broker.Api.EditRequiredRefInfo<string> Sooloos.Broker.Api.PerformerEditInfo::Name", "propType": 23 }, { "shortName": "LastFirstName", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.PerformerEditInfo::LastFirstName", "propType": 23 }, { "shortName": "BirthPlace", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.PerformerEditInfo::BirthPlace", "propType": 23 }, { "shortName": "DeathPlace", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.PerformerEditInfo::DeathPlace", "propType": 23 }, { "shortName": "Country", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<string> Sooloos.Broker.Api.PerformerEditInfo::Country", "propType": 23 }, { "shortName": "BirthDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.PerformerEditInfo::BirthDate", "propType": 23 }, { "shortName": "DeathDate", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.NullDate> Sooloos.Broker.Api.PerformerEditInfo::DeathDate", "propType": 23 }, { "shortName": "YearsActive", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.YearRange> Sooloos.Broker.Api.PerformerEditInfo::YearsActive", "propType": 23 }, { "shortName": "Images", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.PerformerEditInfo::Images", "propType": 23 }, { "shortName": "MainImage", "name": "Sooloos.Broker.Api.EditOptionalRefInfo<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.PerformerEditInfo::MainImage", "propType": 23 }, { "shortName": "Relationships", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.PerformerRelationship> Sooloos.Broker.Api.PerformerEditInfo::Relationships", "propType": 23 }, { "shortName": "RelatedUrls", "name": "Sooloos.Broker.Api.EditListInfo<Sooloos.Broker.Api.RelatedUrl> Sooloos.Broker.Api.PerformerEditInfo::RelatedUrls", "propType": 23 }, { "shortName": "Genres", "name": "Sooloos.Broker.Api.EditListInfo<string> Sooloos.Broker.Api.PerformerEditInfo::Genres", "propType": 23 }, { "shortName": "AlsoKnownAs", "name": "Sooloos.Broker.Api.EditListInfo<string> Sooloos.Broker.Api.PerformerEditInfo::AlsoKnownAs", "propType": 23 }],
  "Sooloos.Broker.Api.PerformerEdit": [{ "shortName": "PerformerId", "name": "long Sooloos.Broker.Api.PerformerEdit::PerformerId", "propType": 1 }, { "shortName": "IsClassicalComposer", "name": "Sooloos.Broker.Api.EditOptionalVal<bool> Sooloos.Broker.Api.PerformerEdit::IsClassicalComposer", "propType": 23 }, { "shortName": "Type", "name": "Sooloos.Broker.Api.EditOptionalVal<Sooloos.Broker.Api.PerformerType> Sooloos.Broker.Api.PerformerEdit::Type", "propType": 23 }, { "shortName": "Rating", "name": "Sooloos.Broker.Api.EditOptionalVal<int> Sooloos.Broker.Api.PerformerEdit::Rating", "propType": 23 }, { "shortName": "Name", "name": "Sooloos.Broker.Api.EditRequiredRef<string> Sooloos.Broker.Api.PerformerEdit::Name", "propType": 23 }, { "shortName": "LastFirstName", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.PerformerEdit::LastFirstName", "propType": 23 }, { "shortName": "BirthPlace", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.PerformerEdit::BirthPlace", "propType": 23 }, { "shortName": "DeathPlace", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.PerformerEdit::DeathPlace", "propType": 23 }, { "shortName": "Country", "name": "Sooloos.Broker.Api.EditOptionalRef<string> Sooloos.Broker.Api.PerformerEdit::Country", "propType": 23 }, { "shortName": "BirthDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.PerformerEdit::BirthDate", "propType": 23 }, { "shortName": "DeathDate", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.NullDate> Sooloos.Broker.Api.PerformerEdit::DeathDate", "propType": 23 }, { "shortName": "YearsActive", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.YearRange> Sooloos.Broker.Api.PerformerEdit::YearsActive", "propType": 23 }, { "shortName": "Images", "name": "Sooloos.Broker.Api.EditList<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.PerformerEdit::Images", "propType": 23 }, { "shortName": "MainImage", "name": "Sooloos.Broker.Api.EditOptionalRef<Sooloos.Broker.Api.Image> Sooloos.Broker.Api.PerformerEdit::MainImage", "propType": 23 }, { "shortName": "Relationships", "name": "Sooloos.Broker.Api.EditList<Sooloos.Broker.Api.PerformerRelationshipEdit> Sooloos.Broker.Api.PerformerEdit::Relationships", "propType": 23 }, { "shortName": "RelatedUrls", "name": "Sooloos.Broker.Api.EditList<Sooloos.Broker.Api.RelatedUrl> Sooloos.Broker.Api.PerformerEdit::RelatedUrls", "propType": 23 }, { "shortName": "Genres", "name": "Sooloos.Broker.Api.EditList<string> Sooloos.Broker.Api.PerformerEdit::Genres", "propType": 23 }, { "shortName": "AlsoKnownAs", "name": "Sooloos.Broker.Api.EditList<string> Sooloos.Broker.Api.PerformerEdit::AlsoKnownAs", "propType": 23 }, { "shortName": "ClearMetadataEdits", "name": "bool Sooloos.Broker.Api.PerformerEdit::ClearMetadataEdits", "propType": 2 }],
  "Sooloos.Broker.Api.DeletePreview": [{ "shortName": "Action", "name": "Sooloos.Broker.Api.DeleteAction Sooloos.Broker.Api.DeletePreview::Action", "propType": 9 }, { "shortName": "Track", "name": "Sooloos.Broker.Api.TrackLite Sooloos.Broker.Api.DeletePreview::Track", "propType": 23 }, { "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumLite Sooloos.Broker.Api.DeletePreview::Album", "propType": 23 }],
  "Sooloos.Broker.Api.DeleteResult": [{ "shortName": "Preview", "name": "Sooloos.Broker.Api.DeletePreview Sooloos.Broker.Api.DeleteResult::Preview", "propType": 23 }, { "shortName": "Status", "name": "Sooloos.Broker.Api.DeleteStatus Sooloos.Broker.Api.DeleteResult::Status", "propType": 9 }],
  "Sooloos.Broker.Api.EditListInfo`1": [{ "shortName": "LocalValues", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.EditListInfo`1::LocalValues", "propType": 23 }, { "shortName": "MetadataValues", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.EditListInfo`1::MetadataValues", "propType": 23 }, { "shortName": "BaseValues", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.EditListInfo`1::BaseValues", "propType": 23 }, { "shortName": "ClearBaseValues", "name": "bool Sooloos.Broker.Api.EditListInfo`1::ClearBaseValues", "propType": 2 }, { "shortName": "BasePreferLocalValues", "name": "bool Sooloos.Broker.Api.EditListInfo`1::BasePreferLocalValues", "propType": 2 }, { "shortName": "PreferLocalValues", "name": "bool? Sooloos.Broker.Api.EditListInfo`1::PreferLocalValues", "propType": 12 }, { "shortName": "AddValues", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.EditListInfo`1::AddValues", "propType": 23 }, { "shortName": "RemoveValues", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.EditListInfo`1::RemoveValues", "propType": 23 }, { "shortName": "Values", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.EditListInfo`1::Values", "propType": 23 }, { "shortName": "HasLocalLayer", "name": "bool Sooloos.Broker.Api.EditListInfo`1::HasLocalLayer", "propType": 2 }, { "shortName": "HasMetadataLayer", "name": "bool Sooloos.Broker.Api.EditListInfo`1::HasMetadataLayer", "propType": 2 }, { "shortName": "HasEditLayer", "name": "bool Sooloos.Broker.Api.EditListInfo`1::HasEditLayer", "propType": 2 }],
  "Sooloos.Broker.Api.EditRequiredValInfo`1": [{ "shortName": "LocalValue", "name": "T? Sooloos.Broker.Api.EditRequiredValInfo`1::LocalValue", "propType": 23 }, { "shortName": "MetadataValue", "name": "T? Sooloos.Broker.Api.EditRequiredValInfo`1::MetadataValue", "propType": 23 }, { "shortName": "BaseValue", "name": "T Sooloos.Broker.Api.EditRequiredValInfo`1::BaseValue", "propType": 23 }, { "shortName": "BasePreferLocalValue", "name": "bool Sooloos.Broker.Api.EditRequiredValInfo`1::BasePreferLocalValue", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditRequiredValInfo`1::PreferLocalValue", "propType": 12 }, { "shortName": "EditValue", "name": "T? Sooloos.Broker.Api.EditRequiredValInfo`1::EditValue", "propType": 23 }, { "shortName": "Value", "name": "T Sooloos.Broker.Api.EditRequiredValInfo`1::Value", "propType": 23 }, { "shortName": "HasLocalLayer", "name": "bool Sooloos.Broker.Api.EditRequiredValInfo`1::HasLocalLayer", "propType": 2 }, { "shortName": "HasMetadataLayer", "name": "bool Sooloos.Broker.Api.EditRequiredValInfo`1::HasMetadataLayer", "propType": 2 }, { "shortName": "HasEditLayer", "name": "bool Sooloos.Broker.Api.EditRequiredValInfo`1::HasEditLayer", "propType": 2 }],
  "Sooloos.Broker.Api.EditRequiredRefInfo`1": [{ "shortName": "LocalValue", "name": "T Sooloos.Broker.Api.EditRequiredRefInfo`1::LocalValue", "propType": 23 }, { "shortName": "MetadataValue", "name": "T Sooloos.Broker.Api.EditRequiredRefInfo`1::MetadataValue", "propType": 23 }, { "shortName": "BaseValue", "name": "T Sooloos.Broker.Api.EditRequiredRefInfo`1::BaseValue", "propType": 23 }, { "shortName": "BasePreferLocalValue", "name": "bool Sooloos.Broker.Api.EditRequiredRefInfo`1::BasePreferLocalValue", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditRequiredRefInfo`1::PreferLocalValue", "propType": 12 }, { "shortName": "EditValue", "name": "T Sooloos.Broker.Api.EditRequiredRefInfo`1::EditValue", "propType": 23 }, { "shortName": "Value", "name": "T Sooloos.Broker.Api.EditRequiredRefInfo`1::Value", "propType": 23 }, { "shortName": "HasLocalLayer", "name": "bool Sooloos.Broker.Api.EditRequiredRefInfo`1::HasLocalLayer", "propType": 2 }, { "shortName": "HasMetadataLayer", "name": "bool Sooloos.Broker.Api.EditRequiredRefInfo`1::HasMetadataLayer", "propType": 2 }, { "shortName": "HasEditLayer", "name": "bool Sooloos.Broker.Api.EditRequiredRefInfo`1::HasEditLayer", "propType": 2 }],
  "Sooloos.Broker.Api.EditOptionalValInfo`1": [{ "shortName": "LocalValue", "name": "T? Sooloos.Broker.Api.EditOptionalValInfo`1::LocalValue", "propType": 23 }, { "shortName": "MetadataValue", "name": "T? Sooloos.Broker.Api.EditOptionalValInfo`1::MetadataValue", "propType": 23 }, { "shortName": "BaseValue", "name": "T? Sooloos.Broker.Api.EditOptionalValInfo`1::BaseValue", "propType": 23 }, { "shortName": "ClearBaseValue", "name": "bool Sooloos.Broker.Api.EditOptionalValInfo`1::ClearBaseValue", "propType": 2 }, { "shortName": "BasePreferLocalValue", "name": "bool Sooloos.Broker.Api.EditOptionalValInfo`1::BasePreferLocalValue", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditOptionalValInfo`1::PreferLocalValue", "propType": 12 }, { "shortName": "EditValue", "name": "T? Sooloos.Broker.Api.EditOptionalValInfo`1::EditValue", "propType": 23 }, { "shortName": "Value", "name": "T? Sooloos.Broker.Api.EditOptionalValInfo`1::Value", "propType": 23 }, { "shortName": "HasLocalLayer", "name": "bool Sooloos.Broker.Api.EditOptionalValInfo`1::HasLocalLayer", "propType": 2 }, { "shortName": "HasMetadataLayer", "name": "bool Sooloos.Broker.Api.EditOptionalValInfo`1::HasMetadataLayer", "propType": 2 }, { "shortName": "HasEditLayer", "name": "bool Sooloos.Broker.Api.EditOptionalValInfo`1::HasEditLayer", "propType": 2 }],
  "Sooloos.Broker.Api.EditOptionalRefInfo`1": [{ "shortName": "LocalValue", "name": "T Sooloos.Broker.Api.EditOptionalRefInfo`1::LocalValue", "propType": 23 }, { "shortName": "MetadataValue", "name": "T Sooloos.Broker.Api.EditOptionalRefInfo`1::MetadataValue", "propType": 23 }, { "shortName": "BaseValue", "name": "T Sooloos.Broker.Api.EditOptionalRefInfo`1::BaseValue", "propType": 23 }, { "shortName": "ClearBaseValue", "name": "bool Sooloos.Broker.Api.EditOptionalRefInfo`1::ClearBaseValue", "propType": 2 }, { "shortName": "BasePreferLocalValue", "name": "bool Sooloos.Broker.Api.EditOptionalRefInfo`1::BasePreferLocalValue", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditOptionalRefInfo`1::PreferLocalValue", "propType": 12 }, { "shortName": "EditValue", "name": "T Sooloos.Broker.Api.EditOptionalRefInfo`1::EditValue", "propType": 23 }, { "shortName": "Value", "name": "T Sooloos.Broker.Api.EditOptionalRefInfo`1::Value", "propType": 23 }, { "shortName": "HasLocalLayer", "name": "bool Sooloos.Broker.Api.EditOptionalRefInfo`1::HasLocalLayer", "propType": 2 }, { "shortName": "HasMetadataLayer", "name": "bool Sooloos.Broker.Api.EditOptionalRefInfo`1::HasMetadataLayer", "propType": 2 }, { "shortName": "HasEditLayer", "name": "bool Sooloos.Broker.Api.EditOptionalRefInfo`1::HasEditLayer", "propType": 2 }],
  "Sooloos.Broker.Api.EditList`1": [{ "shortName": "ClearBaseValue", "name": "bool? Sooloos.Broker.Api.EditList`1::ClearBaseValue", "propType": 12 }, { "shortName": "ClearEdits", "name": "bool Sooloos.Broker.Api.EditList`1::ClearEdits", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditList`1::PreferLocalValue", "propType": 12 }, { "shortName": "ClearPreferLocalValue", "name": "bool Sooloos.Broker.Api.EditList`1::ClearPreferLocalValue", "propType": 2 }, { "shortName": "AddValues", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.EditList`1::AddValues", "propType": 23 }, { "shortName": "RemoveValues", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.EditList`1::RemoveValues", "propType": 23 }],
  "Sooloos.Broker.Api.EditRequiredVal`1": [{ "shortName": "ClearEdits", "name": "bool Sooloos.Broker.Api.EditRequiredVal`1::ClearEdits", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditRequiredVal`1::PreferLocalValue", "propType": 12 }, { "shortName": "ClearPreferLocalValue", "name": "bool Sooloos.Broker.Api.EditRequiredVal`1::ClearPreferLocalValue", "propType": 2 }, { "shortName": "EditValue", "name": "T? Sooloos.Broker.Api.EditRequiredVal`1::EditValue", "propType": 23 }],
  "Sooloos.Broker.Api.EditRequiredRef`1": [{ "shortName": "ClearEdits", "name": "bool Sooloos.Broker.Api.EditRequiredRef`1::ClearEdits", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditRequiredRef`1::PreferLocalValue", "propType": 12 }, { "shortName": "ClearPreferLocalValue", "name": "bool Sooloos.Broker.Api.EditRequiredRef`1::ClearPreferLocalValue", "propType": 2 }, { "shortName": "EditValue", "name": "T Sooloos.Broker.Api.EditRequiredRef`1::EditValue", "propType": 23 }],
  "Sooloos.Broker.Api.EditOptionalVal`1": [{ "shortName": "ClearBaseValue", "name": "bool? Sooloos.Broker.Api.EditOptionalVal`1::ClearBaseValue", "propType": 12 }, { "shortName": "ClearEdits", "name": "bool Sooloos.Broker.Api.EditOptionalVal`1::ClearEdits", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditOptionalVal`1::PreferLocalValue", "propType": 12 }, { "shortName": "ClearPreferLocalValue", "name": "bool Sooloos.Broker.Api.EditOptionalVal`1::ClearPreferLocalValue", "propType": 2 }, { "shortName": "EditValue", "name": "T? Sooloos.Broker.Api.EditOptionalVal`1::EditValue", "propType": 23 }],
  "Sooloos.Broker.Api.EditOptionalRef`1": [{ "shortName": "ClearBaseValue", "name": "bool? Sooloos.Broker.Api.EditOptionalRef`1::ClearBaseValue", "propType": 12 }, { "shortName": "ClearEdits", "name": "bool Sooloos.Broker.Api.EditOptionalRef`1::ClearEdits", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditOptionalRef`1::PreferLocalValue", "propType": 12 }, { "shortName": "ClearPreferLocalValue", "name": "bool Sooloos.Broker.Api.EditOptionalRef`1::ClearPreferLocalValue", "propType": 2 }, { "shortName": "EditValue", "name": "T Sooloos.Broker.Api.EditOptionalRef`1::EditValue", "propType": 23 }],
  "Sooloos.Broker.Api.HistogramItem`1": [{ "shortName": "Value", "name": "T Sooloos.Broker.Api.HistogramItem`1::Value", "propType": 23 }, { "shortName": "Count", "name": "int Sooloos.Broker.Api.HistogramItem`1::Count", "propType": 0 }, { "shortName": "IsPriority", "name": "bool Sooloos.Broker.Api.HistogramItem`1::IsPriority", "propType": 2 }],
  "Sooloos.Broker.Api.AlbumQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.AlbumOrdering Sooloos.Broker.Api.AlbumQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.AlbumQueryOrdering::Direction", "propType": 9 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.AlbumQueryOrdering::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.AlbumQueryOrdering::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "OrderVariousArtistsByAlbumTitle", "name": "bool Sooloos.Broker.Api.AlbumQueryOrdering::OrderVariousArtistsByAlbumTitle", "propType": 2 }, { "shortName": "AlbumDatePreference", "name": "Sooloos.Broker.Api.AlbumDatePreference Sooloos.Broker.Api.AlbumQueryOrdering::AlbumDatePreference", "propType": 9 }, { "shortName": "RandomSeed", "name": "int Sooloos.Broker.Api.AlbumQueryOrdering::RandomSeed", "propType": 0 }, { "shortName": "VariousArtistsSortKey", "name": "string Sooloos.Broker.Api.AlbumQueryOrdering::VariousArtistsSortKey", "propType": 20 }],
  "Sooloos.Broker.Api.AlbumQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.AlbumQueryOrdering Sooloos.Broker.Api.AlbumQueryCriteria::Ordering", "propType": 23 }, { "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.AlbumQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumQueryCriteria::LanguagePreferences", "propType": 23 }, { "shortName": "RequiresMissingItems", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequiresMissingItems", "propType": 2 }, { "shortName": "RequireTypes", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumType> Sooloos.Broker.Api.AlbumQueryCriteria::RequireTypes", "propType": 23 }, { "shortName": "ExcludeTypes", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumType> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeTypes", "propType": 23 }, { "shortName": "RequireMainImageSizes", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ImageSize> Sooloos.Broker.Api.AlbumQueryCriteria::RequireMainImageSizes", "propType": 23 }, { "shortName": "ExcludeMainImageSizes", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ImageSize> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeMainImageSizes", "propType": 23 }, { "shortName": "RequireLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Location> Sooloos.Broker.Api.AlbumQueryCriteria::RequireLocations", "propType": 23 }, { "shortName": "ExcludeLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Location> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeLocations", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.AlbumQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "RequireTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.AlbumQueryCriteria::RequireTags", "propType": 23 }, { "shortName": "ExcludeTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeTags", "propType": 23 }, { "shortName": "LabelsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumQueryCriteria::LabelsMode", "propType": 9 }, { "shortName": "RequireLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumQueryCriteria::RequireLabels", "propType": 23 }, { "shortName": "ExcludeLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeLabels", "propType": 23 }, { "shortName": "GenresMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumQueryCriteria::GenresMode", "propType": 9 }, { "shortName": "RequireGenres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumQueryCriteria::RequireGenres", "propType": 23 }, { "shortName": "ExcludeGenres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeGenres", "propType": 23 }, { "shortName": "RequireGenreObjects", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.AlbumQueryCriteria::RequireGenreObjects", "propType": 23 }, { "shortName": "ExcludeGenreObjects", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeGenreObjects", "propType": 23 }, { "shortName": "MainPerformersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumQueryCriteria::MainPerformersMode", "propType": 9 }, { "shortName": "RequireMainPerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::RequireMainPerformers", "propType": 23 }, { "shortName": "ExcludeMainPerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeMainPerformers", "propType": 23 }, { "shortName": "PerformersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumQueryCriteria::PerformersMode", "propType": 9 }, { "shortName": "RequirePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::RequirePerformers", "propType": 23 }, { "shortName": "ExcludePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludePerformers", "propType": 23 }, { "shortName": "ProductionMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumQueryCriteria::ProductionMode", "propType": 9 }, { "shortName": "RequireProduction", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::RequireProduction", "propType": 23 }, { "shortName": "ExcludeProduction", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeProduction", "propType": 23 }, { "shortName": "ComposersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumQueryCriteria::ComposersMode", "propType": 9 }, { "shortName": "RequireComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::RequireComposers", "propType": 23 }, { "shortName": "ExcludeComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeComposers", "propType": 23 }, { "shortName": "ConductorsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumQueryCriteria::ConductorsMode", "propType": 9 }, { "shortName": "RequireConductors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::RequireConductors", "propType": 23 }, { "shortName": "ExcludeConductors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeConductors", "propType": 23 }, { "shortName": "RequireSampleRates", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.AlbumQueryCriteria::RequireSampleRates", "propType": 23 }, { "shortName": "ExcludeSampleRates", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeSampleRates", "propType": 23 }, { "shortName": "MinLossyBitRate", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::MinLossyBitRate", "propType": 10 }, { "shortName": "MaxLossyBitRate", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::MaxLossyBitRate", "propType": 10 }, { "shortName": "MinLoudnessRange", "name": "double? Sooloos.Broker.Api.AlbumQueryCriteria::MinLoudnessRange", "propType": 15 }, { "shortName": "MaxLoudnessRange", "name": "double? Sooloos.Broker.Api.AlbumQueryCriteria::MaxLoudnessRange", "propType": 15 }, { "shortName": "RequireBitsPerSample", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.AlbumQueryCriteria::RequireBitsPerSample", "propType": 23 }, { "shortName": "ExcludeBitsPerSample", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeBitsPerSample", "propType": 23 }, { "shortName": "RequireChannelLayout", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumQueryCriteria::RequireChannelLayout", "propType": 23 }, { "shortName": "ExcludeChannelLayout", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeChannelLayout", "propType": 23 }, { "shortName": "RequireFileFormats", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.FileFormat> Sooloos.Broker.Api.AlbumQueryCriteria::RequireFileFormats", "propType": 23 }, { "shortName": "ExcludeFileFormats", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.FileFormat> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeFileFormats", "propType": 23 }, { "shortName": "RequireMultipleFileFormats", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireMultipleFileFormats", "propType": 2 }, { "shortName": "ExcludeMultipleFileFormats", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeMultipleFileFormats", "propType": 2 }, { "shortName": "RequireIsFavorite", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsFavorite", "propType": 2 }, { "shortName": "ExcludeIsFavorite", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsFavorite", "propType": 2 }, { "shortName": "RequireIsBanned", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsBanned", "propType": 2 }, { "shortName": "ExcludeIsBanned", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsBanned", "propType": 2 }, { "shortName": "RequireIsBannedTrack", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsBannedTrack", "propType": 2 }, { "shortName": "ExcludeIsBannedTrack", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsBannedTrack", "propType": 2 }, { "shortName": "RequireIsAvailableTrack", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsAvailableTrack", "propType": 2 }, { "shortName": "ExcludeIsAvailableTrack", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsAvailableTrack", "propType": 2 }, { "shortName": "RequireIsPick", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsPick", "propType": 2 }, { "shortName": "ExcludeIsPick", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsPick", "propType": 2 }, { "shortName": "RequireRatings", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.AlbumQueryCriteria::RequireRatings", "propType": 23 }, { "shortName": "ExcludeRatings", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeRatings", "propType": 23 }, { "shortName": "RequireIsExportSupported", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsExportSupported", "propType": 2 }, { "shortName": "ExcludeIsExportSupported", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsExportSupported", "propType": 2 }, { "shortName": "RequireIsDownloadSupported", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsDownloadSupported", "propType": 2 }, { "shortName": "ExcludeIsDownloadSupported", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsDownloadSupported", "propType": 2 }, { "shortName": "RequireIsMQA", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsMQA", "propType": 2 }, { "shortName": "ExcludeIsMQA", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsMQA", "propType": 2 }, { "shortName": "RequireHasMainImage", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHasMainImage", "propType": 2 }, { "shortName": "ExcludeHasMainImage", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeHasMainImage", "propType": 2 }, { "shortName": "RequireIsIdentified", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsIdentified", "propType": 2 }, { "shortName": "ExcludeIsIdentified", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsIdentified", "propType": 2 }, { "shortName": "RequireHasCorruptTracks", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHasCorruptTracks", "propType": 2 }, { "shortName": "ExcludeHasCorruptTracks", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeHasCorruptTracks", "propType": 2 }, { "shortName": "MinImageCount", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::MinImageCount", "propType": 10 }, { "shortName": "MaxImageCount", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::MaxImageCount", "propType": 10 }, { "shortName": "MinTrackCount", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::MinTrackCount", "propType": 10 }, { "shortName": "MaxTrackCount", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::MaxTrackCount", "propType": 10 }, { "shortName": "MinMediaCount", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::MinMediaCount", "propType": 10 }, { "shortName": "MaxMediaCount", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::MaxMediaCount", "propType": 10 }, { "shortName": "RequirePlayedInLastNDays", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::RequirePlayedInLastNDays", "propType": 10 }, { "shortName": "ExcludePlayedInLastNDays", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::ExcludePlayedInLastNDays", "propType": 10 }, { "shortName": "RequireImportedInLastNDays", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::RequireImportedInLastNDays", "propType": 10 }, { "shortName": "ExcludeImportedInLastNDays", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeImportedInLastNDays", "propType": 10 }, { "shortName": "RequireInTheMostPlayedN", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::RequireInTheMostPlayedN", "propType": 10 }, { "shortName": "ExcludeInTheMostPlayedN", "name": "int? Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeInTheMostPlayedN", "propType": 10 }, { "shortName": "RequireIsLive", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsLive", "propType": 2 }, { "shortName": "ExcludeIsLive", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsLive", "propType": 2 }, { "shortName": "RequireIsCompilation", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsCompilation", "propType": 2 }, { "shortName": "ExcludeIsCompilation", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsCompilation", "propType": 2 }, { "shortName": "RequireIsBootleg", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireIsBootleg", "propType": 2 }, { "shortName": "ExcludeIsBootleg", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeIsBootleg", "propType": 2 }, { "shortName": "MinDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.AlbumQueryCriteria::MinDate", "propType": 23 }, { "shortName": "MaxDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.AlbumQueryCriteria::MaxDate", "propType": 23 }, { "shortName": "InvertDateRange", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::InvertDateRange", "propType": 2 }, { "shortName": "RequireHasDate", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHasDate", "propType": 2 }, { "shortName": "ExcludeHasDate", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeHasDate", "propType": 2 }, { "shortName": "MinImportDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.AlbumQueryCriteria::MinImportDate", "propType": 23 }, { "shortName": "MaxImportDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.AlbumQueryCriteria::MaxImportDate", "propType": 23 }, { "shortName": "InvertImportDateRange", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::InvertImportDateRange", "propType": 2 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::IncludeHidden", "propType": 2 }, { "shortName": "RequireHidden", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHidden", "propType": 2 }, { "shortName": "RequireDuplicates", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireDuplicates", "propType": 2 }, { "shortName": "RequireHasGenres", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHasGenres", "propType": 2 }, { "shortName": "ExcludeHasGenres", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeHasGenres", "propType": 2 }, { "shortName": "RequireContiguousTracks", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireContiguousTracks", "propType": 2 }, { "shortName": "ExcludeContiguousTracks", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeContiguousTracks", "propType": 2 }, { "shortName": "RequireHasBackCover", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHasBackCover", "propType": 2 }, { "shortName": "ExcludeHasBackCover", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeHasBackCover", "propType": 2 }, { "shortName": "RequireHasAdditionalImages", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHasAdditionalImages", "propType": 2 }, { "shortName": "ExcludeHasAdditionalImages", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeHasAdditionalImages", "propType": 2 }, { "shortName": "RequireHasLinerNotes", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHasLinerNotes", "propType": 2 }, { "shortName": "ExcludeHasLinerNotes", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeHasLinerNotes", "propType": 2 }, { "shortName": "RequireHasPdf", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::RequireHasPdf", "propType": 2 }, { "shortName": "ExcludeHasPdf", "name": "bool Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeHasPdf", "propType": 2 }, { "shortName": "RequireDownloadedAlbumIds", "name": "System.Collections.Generic.IList<long> Sooloos.Broker.Api.AlbumQueryCriteria::RequireDownloadedAlbumIds", "propType": 23 }, { "shortName": "ExcludeDownloadedAlbumIds", "name": "System.Collections.Generic.IList<long> Sooloos.Broker.Api.AlbumQueryCriteria::ExcludeDownloadedAlbumIds", "propType": 23 }, { "shortName": "SimilarToAlbums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.AlbumQueryCriteria::SimilarToAlbums", "propType": 23 }],
  "Sooloos.Broker.Api.GenreQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.GenreOrdering Sooloos.Broker.Api.GenreQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.GenreQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.GenreQueryCriteria": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.GenreQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "Ordering", "name": "Sooloos.Broker.Api.GenreQueryOrdering Sooloos.Broker.Api.GenreQueryCriteria::Ordering", "propType": 23 }, { "shortName": "RequireInUse", "name": "bool? Sooloos.Broker.Api.GenreQueryCriteria::RequireInUse", "propType": 12 }, { "shortName": "RequireDirectlyInUse", "name": "bool? Sooloos.Broker.Api.GenreQueryCriteria::RequireDirectlyInUse", "propType": 12 }, { "shortName": "LimitToParent", "name": "string Sooloos.Broker.Api.GenreQueryCriteria::LimitToParent", "propType": 20 }, { "shortName": "MaximumLevel", "name": "int? Sooloos.Broker.Api.GenreQueryCriteria::MaximumLevel", "propType": 10 }],
  "Sooloos.Broker.Api.FormQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.FormOrdering Sooloos.Broker.Api.FormQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.FormQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.FormQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.FormQueryOrdering Sooloos.Broker.Api.FormQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.FormQueryCriteria::TextFilter", "propType": 20 }],
  "Sooloos.Broker.Api.PeriodQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.PeriodOrdering Sooloos.Broker.Api.PeriodQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.PeriodQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.PeriodQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.PeriodQueryOrdering Sooloos.Broker.Api.PeriodQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.PeriodQueryCriteria::TextFilter", "propType": 20 }],
  "Sooloos.Broker.Api.CountryQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.CountryOrdering Sooloos.Broker.Api.CountryQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.CountryQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.CountryQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.CountryQueryOrdering Sooloos.Broker.Api.CountryQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.CountryQueryCriteria::TextFilter", "propType": 20 }],
  "Sooloos.Broker.Api.LabelQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.LabelOrdering Sooloos.Broker.Api.LabelQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.LabelQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.LabelQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.LabelQueryOrdering Sooloos.Broker.Api.LabelQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.LabelQueryCriteria::TextFilter", "propType": 20 }],
  "Sooloos.Broker.Api.PlaceQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.PlaceOrdering Sooloos.Broker.Api.PlaceQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.PlaceQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.PlaceQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.PlaceQueryOrdering Sooloos.Broker.Api.PlaceQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.PlaceQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "RequireIsBirthPlace", "name": "bool Sooloos.Broker.Api.PlaceQueryCriteria::RequireIsBirthPlace", "propType": 2 }, { "shortName": "ExcludeIsBirthPlace", "name": "bool Sooloos.Broker.Api.PlaceQueryCriteria::ExcludeIsBirthPlace", "propType": 2 }, { "shortName": "RequireIsDeathPlace", "name": "bool Sooloos.Broker.Api.PlaceQueryCriteria::RequireIsDeathPlace", "propType": 2 }, { "shortName": "ExcludeIsDeathPlace", "name": "bool Sooloos.Broker.Api.PlaceQueryCriteria::ExcludeIsDeathPlace", "propType": 2 }],
  "Sooloos.Broker.Api.TagQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.TagOrdering Sooloos.Broker.Api.TagQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.TagQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.TagQueryCriteria": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.TagQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "Ordering", "name": "Sooloos.Broker.Api.TagQueryOrdering Sooloos.Broker.Api.TagQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.TagQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "RequireProfiles", "name": "System.Collections.Generic.IList<System.Sooid> Sooloos.Broker.Api.TagQueryCriteria::RequireProfiles", "propType": 23 }, { "shortName": "IncludeTagsWithNoProfile", "name": "bool? Sooloos.Broker.Api.TagQueryCriteria::IncludeTagsWithNoProfile", "propType": 12 }],
  "Sooloos.Broker.Api.CreditRoleQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.CreditRoleOrdering Sooloos.Broker.Api.CreditRoleQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.CreditRoleQueryOrdering::Direction", "propType": 9 }, { "shortName": "Performers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.CreditRoleQueryOrdering::Performers", "propType": 23 }],
  "Sooloos.Broker.Api.CreditRoleQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.CreditRoleQueryOrdering Sooloos.Broker.Api.CreditRoleQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.CreditRoleQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "IncludeUnreferenced", "name": "bool Sooloos.Broker.Api.CreditRoleQueryCriteria::IncludeUnreferenced", "propType": 2 }],
  "Sooloos.Broker.Api.PerformerQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.PerformerOrdering Sooloos.Broker.Api.PerformerQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.PerformerQueryOrdering::Direction", "propType": 9 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.PerformerQueryOrdering::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.PerformerQueryOrdering::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "AlbumDatePreference", "name": "Sooloos.Broker.Api.AlbumDatePreference Sooloos.Broker.Api.PerformerQueryOrdering::AlbumDatePreference", "propType": 9 }],
  "Sooloos.Broker.Api.PerformerQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.PerformerQueryOrdering Sooloos.Broker.Api.PerformerQueryCriteria::Ordering", "propType": 23 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::LanguagePreferences", "propType": 23 }, { "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.PerformerQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::IncludeHidden", "propType": 2 }, { "shortName": "IncludeInterestingComposers", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::IncludeInterestingComposers", "propType": 2 }, { "shortName": "IncludeUninterestingComposers", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::IncludeUninterestingComposers", "propType": 2 }, { "shortName": "RequireIsClassicalComposer", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireIsClassicalComposer", "propType": 2 }, { "shortName": "ExcludeIsClassicalComposer", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeIsClassicalComposer", "propType": 2 }, { "shortName": "RequiresMissingItems", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequiresMissingItems", "propType": 2 }, { "shortName": "Substring", "name": "string Sooloos.Broker.Api.PerformerQueryCriteria::Substring", "propType": 20 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.PerformerQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "RequireIsMainPerformer", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireIsMainPerformer", "propType": 2 }, { "shortName": "ExcludeIsMainPerformer", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeIsMainPerformer", "propType": 2 }, { "shortName": "RequireIsComposer", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireIsComposer", "propType": 2 }, { "shortName": "ExcludeIsComposer", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeIsComposer", "propType": 2 }, { "shortName": "RequireIsConductor", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireIsConductor", "propType": 2 }, { "shortName": "ExcludeIsConductor", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeIsConductor", "propType": 2 }, { "shortName": "RequirePerformerTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.PerformerQueryCriteria::RequirePerformerTags", "propType": 23 }, { "shortName": "ExcludePerformerTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludePerformerTags", "propType": 23 }, { "shortName": "RequireComposerTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.PerformerQueryCriteria::RequireComposerTags", "propType": 23 }, { "shortName": "ExcludeComposerTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeComposerTags", "propType": 23 }, { "shortName": "RequireLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Location> Sooloos.Broker.Api.PerformerQueryCriteria::RequireLocations", "propType": 23 }, { "shortName": "ExcludeLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Location> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeLocations", "propType": 23 }, { "shortName": "RequireTypes", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerType> Sooloos.Broker.Api.PerformerQueryCriteria::RequireTypes", "propType": 23 }, { "shortName": "ExcludeTypes", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerType> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeTypes", "propType": 23 }, { "shortName": "BirthPlacesMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.PerformerQueryCriteria::BirthPlacesMode", "propType": 9 }, { "shortName": "RequireBirthPlaces", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::RequireBirthPlaces", "propType": 23 }, { "shortName": "ExcludeBirthPlaces", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeBirthPlaces", "propType": 23 }, { "shortName": "DeathPlacesMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.PerformerQueryCriteria::DeathPlacesMode", "propType": 9 }, { "shortName": "RequireDeathPlaces", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::RequireDeathPlaces", "propType": 23 }, { "shortName": "ExcludeDeathPlaces", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeDeathPlaces", "propType": 23 }, { "shortName": "CountriesMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.PerformerQueryCriteria::CountriesMode", "propType": 9 }, { "shortName": "RequireCountries", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::RequireCountries", "propType": 23 }, { "shortName": "ExcludeCountries", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeCountries", "propType": 23 }, { "shortName": "PeriodsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.PerformerQueryCriteria::PeriodsMode", "propType": 9 }, { "shortName": "RequirePeriods", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::RequirePeriods", "propType": 23 }, { "shortName": "ExcludePeriods", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludePeriods", "propType": 23 }, { "shortName": "GenresMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.PerformerQueryCriteria::GenresMode", "propType": 9 }, { "shortName": "RequireGenres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::RequireGenres", "propType": 23 }, { "shortName": "ExcludeGenres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeGenres", "propType": 23 }, { "shortName": "RequireGenreObjects", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.PerformerQueryCriteria::RequireGenreObjects", "propType": 23 }, { "shortName": "ExcludeGenreObjects", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeGenreObjects", "propType": 23 }, { "shortName": "RequireIsFavorite", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireIsFavorite", "propType": 2 }, { "shortName": "ExcludeIsFavorite", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeIsFavorite", "propType": 2 }, { "shortName": "RequireIsBanned", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireIsBanned", "propType": 2 }, { "shortName": "ExcludeIsBanned", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeIsBanned", "propType": 2 }, { "shortName": "MinYearAlive", "name": "int? Sooloos.Broker.Api.PerformerQueryCriteria::MinYearAlive", "propType": 10 }, { "shortName": "MaxYearAlive", "name": "int? Sooloos.Broker.Api.PerformerQueryCriteria::MaxYearAlive", "propType": 10 }, { "shortName": "MinYearActive", "name": "int? Sooloos.Broker.Api.PerformerQueryCriteria::MinYearActive", "propType": 10 }, { "shortName": "MaxYearActive", "name": "int? Sooloos.Broker.Api.PerformerQueryCriteria::MaxYearActive", "propType": 10 }, { "shortName": "RequireHasGenres", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireHasGenres", "propType": 2 }, { "shortName": "ExcludeHasGenres", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeHasGenres", "propType": 2 }, { "shortName": "MinAlbumCount", "name": "int? Sooloos.Broker.Api.PerformerQueryCriteria::MinAlbumCount", "propType": 10 }, { "shortName": "MaxAlbumCount", "name": "int? Sooloos.Broker.Api.PerformerQueryCriteria::MaxAlbumCount", "propType": 10 }, { "shortName": "RequireIsExportSupported", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireIsExportSupported", "propType": 2 }, { "shortName": "ExcludeIsExportSupported", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeIsExportSupported", "propType": 2 }, { "shortName": "RequireIsComposerExportSupported", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::RequireIsComposerExportSupported", "propType": 2 }, { "shortName": "ExcludeIsComposerExportSupported", "name": "bool Sooloos.Broker.Api.PerformerQueryCriteria::ExcludeIsComposerExportSupported", "propType": 2 }, { "shortName": "SimilarToPerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.PerformerQueryCriteria::SimilarToPerformers", "propType": 23 }],
  "Sooloos.Broker.Api.TrackQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.TrackOrdering Sooloos.Broker.Api.TrackQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.TrackQueryOrdering::Direction", "propType": 9 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.TrackQueryOrdering::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.TrackQueryOrdering::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "AlbumDatePreference", "name": "Sooloos.Broker.Api.AlbumDatePreference Sooloos.Broker.Api.TrackQueryOrdering::AlbumDatePreference", "propType": 9 }, { "shortName": "RandomSeed", "name": "int Sooloos.Broker.Api.TrackQueryOrdering::RandomSeed", "propType": 0 }],
  "Sooloos.Broker.Api.TrackQueryCriteria": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "Ordering", "name": "Sooloos.Broker.Api.TrackQueryOrdering Sooloos.Broker.Api.TrackQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "TextFilterIgnoresMainPerformer", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::TextFilterIgnoresMainPerformer", "propType": 2 }, { "shortName": "TrackTitleTextFilter", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::TrackTitleTextFilter", "propType": 20 }, { "shortName": "AlbumTitleTextFilter", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::AlbumTitleTextFilter", "propType": 20 }, { "shortName": "AlbumPerformedByTextFilter", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::AlbumPerformedByTextFilter", "propType": 20 }, { "shortName": "TrackMainPerformerTextFilter", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::TrackMainPerformerTextFilter", "propType": 20 }, { "shortName": "TrackComposerTextFilter", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::TrackComposerTextFilter", "propType": 20 }, { "shortName": "PathTextFilter", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::PathTextFilter", "propType": 20 }, { "shortName": "RequiresMissingItems", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequiresMissingItems", "propType": 2 }, { "shortName": "MainPerformersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackQueryCriteria::MainPerformersMode", "propType": 9 }, { "shortName": "RequireMainPerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::RequireMainPerformers", "propType": 23 }, { "shortName": "ExcludeMainPerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeMainPerformers", "propType": 23 }, { "shortName": "PerformersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackQueryCriteria::PerformersMode", "propType": 9 }, { "shortName": "RequirePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::RequirePerformers", "propType": 23 }, { "shortName": "ExcludePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::ExcludePerformers", "propType": 23 }, { "shortName": "ProductionMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackQueryCriteria::ProductionMode", "propType": 9 }, { "shortName": "RequireProduction", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::RequireProduction", "propType": 23 }, { "shortName": "ExcludeProduction", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeProduction", "propType": 23 }, { "shortName": "ComposersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackQueryCriteria::ComposersMode", "propType": 9 }, { "shortName": "RequireComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::RequireComposers", "propType": 23 }, { "shortName": "ExcludeComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeComposers", "propType": 23 }, { "shortName": "ConductorsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackQueryCriteria::ConductorsMode", "propType": 9 }, { "shortName": "RequireConductors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::RequireConductors", "propType": 23 }, { "shortName": "ExcludeConductors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeConductors", "propType": 23 }, { "shortName": "RequireTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.TrackQueryCriteria::RequireTags", "propType": 23 }, { "shortName": "ExcludeTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeTags", "propType": 23 }, { "shortName": "RequireLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Location> Sooloos.Broker.Api.TrackQueryCriteria::RequireLocations", "propType": 23 }, { "shortName": "ExcludeLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Location> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeLocations", "propType": 23 }, { "shortName": "LabelsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackQueryCriteria::LabelsMode", "propType": 9 }, { "shortName": "RequireLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackQueryCriteria::RequireLabels", "propType": 23 }, { "shortName": "ExcludeLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeLabels", "propType": 23 }, { "shortName": "GenresMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackQueryCriteria::GenresMode", "propType": 9 }, { "shortName": "RequireGenres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackQueryCriteria::RequireGenres", "propType": 23 }, { "shortName": "ExcludeGenres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeGenres", "propType": 23 }, { "shortName": "RequireGenreObjects", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.TrackQueryCriteria::RequireGenreObjects", "propType": 23 }, { "shortName": "ExcludeGenreObjects", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeGenreObjects", "propType": 23 }, { "shortName": "MinDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.TrackQueryCriteria::MinDate", "propType": 23 }, { "shortName": "MaxDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.TrackQueryCriteria::MaxDate", "propType": 23 }, { "shortName": "InvertDateRange", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::InvertDateRange", "propType": 2 }, { "shortName": "MinImportDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.TrackQueryCriteria::MinImportDate", "propType": 23 }, { "shortName": "MaxImportDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.TrackQueryCriteria::MaxImportDate", "propType": 23 }, { "shortName": "InvertImportDateRange", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::InvertImportDateRange", "propType": 2 }, { "shortName": "RequirePlayedInLastNDays", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::RequirePlayedInLastNDays", "propType": 10 }, { "shortName": "ExcludePlayedInLastNDays", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::ExcludePlayedInLastNDays", "propType": 10 }, { "shortName": "RequireImportedInLastNDays", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::RequireImportedInLastNDays", "propType": 10 }, { "shortName": "ExcludeImportedInLastNDays", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::ExcludeImportedInLastNDays", "propType": 10 }, { "shortName": "RequireRatings", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.TrackQueryCriteria::RequireRatings", "propType": 23 }, { "shortName": "ExcludeRatings", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeRatings", "propType": 23 }, { "shortName": "RequireIsFavorite", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsFavorite", "propType": 2 }, { "shortName": "ExcludeIsFavorite", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsFavorite", "propType": 2 }, { "shortName": "RequireIsBanned", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsBanned", "propType": 2 }, { "shortName": "ExcludeIsBanned", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsBanned", "propType": 2 }, { "shortName": "RequireIsBannedAlbum", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsBannedAlbum", "propType": 2 }, { "shortName": "ExcludeIsBannedAlbum", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsBannedAlbum", "propType": 2 }, { "shortName": "RequireIsPick", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsPick", "propType": 2 }, { "shortName": "ExcludeIsPick", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsPick", "propType": 2 }, { "shortName": "RequireHasLyrics", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireHasLyrics", "propType": 2 }, { "shortName": "ExcludeHasLyrics", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeHasLyrics", "propType": 2 }, { "shortName": "RequireInTheMostPlayedN", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::RequireInTheMostPlayedN", "propType": 10 }, { "shortName": "ExcludeInTheMostPlayedN", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::ExcludeInTheMostPlayedN", "propType": 10 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::IncludeHidden", "propType": 2 }, { "shortName": "RequireHidden", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireHidden", "propType": 2 }, { "shortName": "RequireIsLive", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsLive", "propType": 2 }, { "shortName": "ExcludeIsLive", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsLive", "propType": 2 }, { "shortName": "RequireIsTidal", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsTidal", "propType": 2 }, { "shortName": "ExcludeIsTidal", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsTidal", "propType": 2 }, { "shortName": "RequireIsQobuz", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsQobuz", "propType": 2 }, { "shortName": "ExcludeIsQobuz", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsQobuz", "propType": 2 }, { "shortName": "RequireIsLossy", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsLossy", "propType": 2 }, { "shortName": "ExcludeIsLossy", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsLossy", "propType": 2 }, { "shortName": "RequireIsLossless", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsLossless", "propType": 2 }, { "shortName": "ExcludeIsLossless", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsLossless", "propType": 2 }, { "shortName": "RequireIsMQA", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsMQA", "propType": 2 }, { "shortName": "ExcludeIsMQA", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsMQA", "propType": 2 }, { "shortName": "RequireIsLocal", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsLocal", "propType": 2 }, { "shortName": "ExcludeIsLocal", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsLocal", "propType": 2 }, { "shortName": "MinPlayCount", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::MinPlayCount", "propType": 10 }, { "shortName": "MaxPlayCount", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::MaxPlayCount", "propType": 10 }, { "shortName": "RequireIsExportSupported", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsExportSupported", "propType": 2 }, { "shortName": "ExcludeIsExportSupported", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsExportSupported", "propType": 2 }, { "shortName": "RequireIsDownloadSupported", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsDownloadSupported", "propType": 2 }, { "shortName": "ExcludeIsDownloadSupported", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsDownloadSupported", "propType": 2 }, { "shortName": "RequireIsAvailable", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsAvailable", "propType": 2 }, { "shortName": "ExcludeIsAvailable", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsAvailable", "propType": 2 }, { "shortName": "RequireSampleRates", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.TrackQueryCriteria::RequireSampleRates", "propType": 23 }, { "shortName": "ExcludeSampleRates", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeSampleRates", "propType": 23 }, { "shortName": "MinLossyBitRate", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::MinLossyBitRate", "propType": 10 }, { "shortName": "MaxLossyBitRate", "name": "int? Sooloos.Broker.Api.TrackQueryCriteria::MaxLossyBitRate", "propType": 10 }, { "shortName": "MinLoudnessRange", "name": "double? Sooloos.Broker.Api.TrackQueryCriteria::MinLoudnessRange", "propType": 15 }, { "shortName": "MaxLoudnessRange", "name": "double? Sooloos.Broker.Api.TrackQueryCriteria::MaxLoudnessRange", "propType": 15 }, { "shortName": "RequireBitsPerSample", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.TrackQueryCriteria::RequireBitsPerSample", "propType": 23 }, { "shortName": "ExcludeBitsPerSample", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeBitsPerSample", "propType": 23 }, { "shortName": "RequireChannelLayout", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackQueryCriteria::RequireChannelLayout", "propType": 23 }, { "shortName": "ExcludeChannelLayout", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeChannelLayout", "propType": 23 }, { "shortName": "RequireFileFormats", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.FileFormat> Sooloos.Broker.Api.TrackQueryCriteria::RequireFileFormats", "propType": 23 }, { "shortName": "ExcludeFileFormats", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.FileFormat> Sooloos.Broker.Api.TrackQueryCriteria::ExcludeFileFormats", "propType": 23 }, { "shortName": "RequireInDirectory", "name": "string Sooloos.Broker.Api.TrackQueryCriteria::RequireInDirectory", "propType": 20 }, { "shortName": "RequireIsIdentified", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsIdentified", "propType": 2 }, { "shortName": "ExcludeIsIdentified", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsIdentified", "propType": 2 }, { "shortName": "RequireIsCorrupt", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::RequireIsCorrupt", "propType": 2 }, { "shortName": "ExcludeIsCorrupt", "name": "bool Sooloos.Broker.Api.TrackQueryCriteria::ExcludeIsCorrupt", "propType": 2 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackQueryCriteria::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.WorkQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.WorkOrdering Sooloos.Broker.Api.WorkQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.WorkQueryOrdering::Direction", "propType": 9 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.WorkQueryOrdering::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.WorkQueryOrdering::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "NumberingSystemName", "name": "string Sooloos.Broker.Api.WorkQueryOrdering::NumberingSystemName", "propType": 20 }, { "shortName": "AlbumDatePreference", "name": "Sooloos.Broker.Api.AlbumDatePreference Sooloos.Broker.Api.WorkQueryOrdering::AlbumDatePreference", "propType": 9 }],
  "Sooloos.Broker.Api.WorkQueryCriteria": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.WorkQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::LanguagePreferences", "propType": 23 }, { "shortName": "Ordering", "name": "Sooloos.Broker.Api.WorkQueryOrdering Sooloos.Broker.Api.WorkQueryCriteria::Ordering", "propType": 23 }, { "shortName": "IncludeUninterestingWorks", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::IncludeUninterestingWorks", "propType": 2 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::IncludeHidden", "propType": 2 }, { "shortName": "RequireHidden", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::RequireHidden", "propType": 2 }, { "shortName": "RequireHasClassicalComposer", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::RequireHasClassicalComposer", "propType": 2 }, { "shortName": "ExcludeHasClassicalComposer", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::ExcludeHasClassicalComposer", "propType": 2 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.WorkQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "WorkTitleTextFilter", "name": "string Sooloos.Broker.Api.WorkQueryCriteria::WorkTitleTextFilter", "propType": 20 }, { "shortName": "WorkComposerTextFilter", "name": "string Sooloos.Broker.Api.WorkQueryCriteria::WorkComposerTextFilter", "propType": 20 }, { "shortName": "WorkPeriodTextFilter", "name": "string Sooloos.Broker.Api.WorkQueryCriteria::WorkPeriodTextFilter", "propType": 20 }, { "shortName": "WorkFormTextFilter", "name": "string Sooloos.Broker.Api.WorkQueryCriteria::WorkFormTextFilter", "propType": 20 }, { "shortName": "WorkInstrumentationTextFilter", "name": "string Sooloos.Broker.Api.WorkQueryCriteria::WorkInstrumentationTextFilter", "propType": 20 }, { "shortName": "RequiresMissingItems", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::RequiresMissingItems", "propType": 2 }, { "shortName": "ComposersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.WorkQueryCriteria::ComposersMode", "propType": 9 }, { "shortName": "RequireComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.WorkQueryCriteria::RequireComposers", "propType": 23 }, { "shortName": "ExcludeComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.WorkQueryCriteria::ExcludeComposers", "propType": 23 }, { "shortName": "PeriodsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.WorkQueryCriteria::PeriodsMode", "propType": 9 }, { "shortName": "RequirePeriods", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::RequirePeriods", "propType": 23 }, { "shortName": "ExcludePeriods", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::ExcludePeriods", "propType": 23 }, { "shortName": "GenresMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.WorkQueryCriteria::GenresMode", "propType": 9 }, { "shortName": "RequireGenres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::RequireGenres", "propType": 23 }, { "shortName": "ExcludeGenres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::ExcludeGenres", "propType": 23 }, { "shortName": "FormsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.WorkQueryCriteria::FormsMode", "propType": 9 }, { "shortName": "RequireForms", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::RequireForms", "propType": 23 }, { "shortName": "ExcludeForms", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::ExcludeForms", "propType": 23 }, { "shortName": "InstrumentationsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.WorkQueryCriteria::InstrumentationsMode", "propType": 9 }, { "shortName": "RequireInstrumentations", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::RequireInstrumentations", "propType": 23 }, { "shortName": "ExcludeInstrumentations", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkQueryCriteria::ExcludeInstrumentations", "propType": 23 }, { "shortName": "RequireTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.WorkQueryCriteria::RequireTags", "propType": 23 }, { "shortName": "ExcludeTags", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TagLite> Sooloos.Broker.Api.WorkQueryCriteria::ExcludeTags", "propType": 23 }, { "shortName": "RequireLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Location> Sooloos.Broker.Api.WorkQueryCriteria::RequireLocations", "propType": 23 }, { "shortName": "ExcludeLocations", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.Location> Sooloos.Broker.Api.WorkQueryCriteria::ExcludeLocations", "propType": 23 }, { "shortName": "RequireIsFavorite", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::RequireIsFavorite", "propType": 2 }, { "shortName": "ExcludeIsFavorite", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::ExcludeIsFavorite", "propType": 2 }, { "shortName": "RequireIsBanned", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::RequireIsBanned", "propType": 2 }, { "shortName": "ExcludeIsBanned", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::ExcludeIsBanned", "propType": 2 }, { "shortName": "MinPerformanceCount", "name": "int? Sooloos.Broker.Api.WorkQueryCriteria::MinPerformanceCount", "propType": 10 }, { "shortName": "MaxPerformanceCount", "name": "int? Sooloos.Broker.Api.WorkQueryCriteria::MaxPerformanceCount", "propType": 10 }, { "shortName": "MinCompositionDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.WorkQueryCriteria::MinCompositionDate", "propType": 23 }, { "shortName": "MaxCompositionDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.WorkQueryCriteria::MaxCompositionDate", "propType": 23 }, { "shortName": "InvertCompositionDateRange", "name": "bool Sooloos.Broker.Api.WorkQueryCriteria::InvertCompositionDateRange", "propType": 2 }],
  "Sooloos.Broker.Api.HistoryQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.HistoryOrdering Sooloos.Broker.Api.HistoryQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.HistoryQueryOrdering::Direction", "propType": 9 }],
  "Sooloos.Broker.Api.HistoryQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.HistoryQueryOrdering Sooloos.Broker.Api.HistoryQueryCriteria::Ordering", "propType": 23 }, { "shortName": "MinPlayDate", "name": "System.DateTime? Sooloos.Broker.Api.HistoryQueryCriteria::MinPlayDate", "propType": 18 }, { "shortName": "MaxPlayDate", "name": "System.DateTime? Sooloos.Broker.Api.HistoryQueryCriteria::MaxPlayDate", "propType": 18 }, { "shortName": "InvertPlayDateRange", "name": "bool Sooloos.Broker.Api.HistoryQueryCriteria::InvertPlayDateRange", "propType": 2 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.HistoryQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "TextFilterIgnoresAlbum", "name": "bool Sooloos.Broker.Api.HistoryQueryCriteria::TextFilterIgnoresAlbum", "propType": 2 }, { "shortName": "TextFilterIgnoresMainPerformer", "name": "bool Sooloos.Broker.Api.HistoryQueryCriteria::TextFilterIgnoresMainPerformer", "propType": 2 }, { "shortName": "RequireAlbums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.HistoryQueryCriteria::RequireAlbums", "propType": 23 }, { "shortName": "ExcludeAlbums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.HistoryQueryCriteria::ExcludeAlbums", "propType": 23 }, { "shortName": "RequireTracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.HistoryQueryCriteria::RequireTracks", "propType": 23 }, { "shortName": "ExcludeTracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.TrackLite> Sooloos.Broker.Api.HistoryQueryCriteria::ExcludeTracks", "propType": 23 }, { "shortName": "RequireMainPerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.HistoryQueryCriteria::RequireMainPerformers", "propType": 23 }, { "shortName": "ExcludeMainPerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.HistoryQueryCriteria::ExcludeMainPerformers", "propType": 23 }, { "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.HistoryQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.HistoryQueryCriteria::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.PerformanceQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.PerformanceOrdering Sooloos.Broker.Api.PerformanceQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.PerformanceQueryOrdering::Direction", "propType": 9 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.PerformanceQueryOrdering::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.PerformanceQueryOrdering::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "AlbumDatePreference", "name": "Sooloos.Broker.Api.AlbumDatePreference Sooloos.Broker.Api.PerformanceQueryOrdering::AlbumDatePreference", "propType": 9 }],
  "Sooloos.Broker.Api.FolderItemQueryOrdering": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.FolderItemOrdering Sooloos.Broker.Api.FolderItemQueryOrdering::Ordering", "propType": 9 }, { "shortName": "Direction", "name": "Sooloos.Broker.Api.OrderingDirection Sooloos.Broker.Api.FolderItemQueryOrdering::Direction", "propType": 9 }, { "shortName": "OrderByLastFirstName", "name": "bool Sooloos.Broker.Api.FolderItemQueryOrdering::OrderByLastFirstName", "propType": 2 }, { "shortName": "OrderComposersByLastFirstName", "name": "bool Sooloos.Broker.Api.FolderItemQueryOrdering::OrderComposersByLastFirstName", "propType": 2 }, { "shortName": "OrderVariousArtistsByAlbumTitle", "name": "bool Sooloos.Broker.Api.FolderItemQueryOrdering::OrderVariousArtistsByAlbumTitle", "propType": 2 }, { "shortName": "AlbumDatePreference", "name": "Sooloos.Broker.Api.AlbumDatePreference Sooloos.Broker.Api.FolderItemQueryOrdering::AlbumDatePreference", "propType": 9 }, { "shortName": "VariousArtistsSortKey", "name": "string Sooloos.Broker.Api.FolderItemQueryOrdering::VariousArtistsSortKey", "propType": 20 }],
  "Sooloos.Broker.Api.FolderItemQueryCriteria": [{ "shortName": "Ordering", "name": "Sooloos.Broker.Api.FolderItemQueryOrdering Sooloos.Broker.Api.FolderItemQueryCriteria::Ordering", "propType": 23 }, { "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.FolderItemQueryCriteria::TextFilter", "propType": 20 }, { "shortName": "TextFilterIgnoresMainPerformer", "name": "bool Sooloos.Broker.Api.FolderItemQueryCriteria::TextFilterIgnoresMainPerformer", "propType": 2 }, { "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.FolderItemQueryCriteria::UiLanguage", "propType": 20 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.FolderItemQueryCriteria::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.TidalCollection": [{ "shortName": "TidalCollectionId", "name": "string Sooloos.Broker.Api.TidalCollection::TidalCollectionId", "propType": 20 }, { "shortName": "Name", "name": "string Sooloos.Broker.Api.TidalCollection::Name", "propType": 20 }, { "shortName": "AlbumCount", "name": "int Sooloos.Broker.Api.TidalCollection::AlbumCount", "propType": 0 }],
  "Sooloos.Broker.Api.TidalGenre": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.TidalGenre::Name", "propType": 20 }, { "shortName": "Path", "name": "string Sooloos.Broker.Api.TidalGenre::Path", "propType": 20 }, { "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.TidalGenre::Image", "propType": 23 }],
  "Sooloos.Broker.Api.TidalMood": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.TidalMood::Name", "propType": 20 }, { "shortName": "Path", "name": "string Sooloos.Broker.Api.TidalMood::Path", "propType": 20 }, { "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.TidalMood::Image", "propType": 23 }],
  "Sooloos.Broker.Api.PartialList`1": [{ "shortName": "Items", "name": "System.Collections.Generic.IList<T> Sooloos.Broker.Api.PartialList`1::Items", "propType": 23 }, { "shortName": "Offset", "name": "int Sooloos.Broker.Api.PartialList`1::Offset", "propType": 0 }, { "shortName": "TotalCount", "name": "int Sooloos.Broker.Api.PartialList`1::TotalCount", "propType": 0 }],
  "Sooloos.Broker.Api.TidalPromotion": [],
  "Sooloos.Broker.Api.SongkickEvent": [{ "shortName": "Id", "name": "int Sooloos.Broker.Api.SongkickEvent::Id", "propType": 0 }, { "shortName": "Name", "name": "string Sooloos.Broker.Api.SongkickEvent::Name", "propType": 20 }, { "shortName": "Artists", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.SongkickEvent::Artists", "propType": 23 }, { "shortName": "Type", "name": "string Sooloos.Broker.Api.SongkickEvent::Type", "propType": 20 }, { "shortName": "Url", "name": "string Sooloos.Broker.Api.SongkickEvent::Url", "propType": 20 }, { "shortName": "Date", "name": "Sooloos.NullDate Sooloos.Broker.Api.SongkickEvent::Date", "propType": 23 }, { "shortName": "EndDate", "name": "Sooloos.NullDate Sooloos.Broker.Api.SongkickEvent::EndDate", "propType": 23 }, { "shortName": "Venue", "name": "string Sooloos.Broker.Api.SongkickEvent::Venue", "propType": 20 }, { "shortName": "Location", "name": "string Sooloos.Broker.Api.SongkickEvent::Location", "propType": 20 }, { "shortName": "Distance", "name": "double Sooloos.Broker.Api.SongkickEvent::Distance", "propType": 5 }, { "shortName": "Canceled", "name": "bool Sooloos.Broker.Api.SongkickEvent::Canceled", "propType": 2 }],
  "Sooloos.Broker.Api.SongkickArtistEvents": [{ "shortName": "FeaturedEvents", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SongkickEvent> Sooloos.Broker.Api.SongkickArtistEvents::FeaturedEvents", "propType": 23 }, { "shortName": "AllEvents", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SongkickEvent> Sooloos.Broker.Api.SongkickArtistEvents::AllEvents", "propType": 23 }],
  "Sooloos.Broker.Api.QobuzGenre": [{ "shortName": "Name", "name": "string Sooloos.Broker.Api.QobuzGenre::Name", "propType": 20 }, { "shortName": "GenreId", "name": "string Sooloos.Broker.Api.QobuzGenre::GenreId", "propType": 20 }],
  "Sooloos.Broker.Api.NugsArtist": [{ "shortName": "ArtistId", "name": "long Sooloos.Broker.Api.NugsArtist::ArtistId", "propType": 1 }, { "shortName": "NumShows", "name": "int Sooloos.Broker.Api.NugsArtist::NumShows", "propType": 0 }, { "shortName": "NumAlbums", "name": "int Sooloos.Broker.Api.NugsArtist::NumAlbums", "propType": 0 }, { "shortName": "ArtistName", "name": "string Sooloos.Broker.Api.NugsArtist::ArtistName", "propType": 20 }, { "shortName": "Artist", "name": "Sooloos.Broker.Api.PerformerLite Sooloos.Broker.Api.NugsArtist::Artist", "propType": 23 }],
  "Sooloos.Broker.Api.NugsDecade": [{ "shortName": "DecadeText", "name": "string Sooloos.Broker.Api.NugsDecade::DecadeText", "propType": 20 }, { "shortName": "Years", "name": "System.Collections.Generic.IList<int> Sooloos.Broker.Api.NugsDecade::Years", "propType": 23 }],
  "Sooloos.Broker.Api.NugsSearchResult": [{ "shortName": "Query", "name": "string Sooloos.Broker.Api.NugsSearchResult::Query", "propType": 20 }, { "shortName": "Albums", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.AlbumLite> Sooloos.Broker.Api.NugsSearchResult::Albums", "propType": 23 }, { "shortName": "Songs", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.NugsSong> Sooloos.Broker.Api.NugsSearchResult::Songs", "propType": 23 }, { "shortName": "Venues", "name": "Sooloos.Broker.Api.DataList<Sooloos.Broker.Api.NugsVenue> Sooloos.Broker.Api.NugsSearchResult::Venues", "propType": 23 }],
  "Sooloos.Broker.Api.NugsVenue": [{ "shortName": "Id", "name": "int Sooloos.Broker.Api.NugsVenue::Id", "propType": 0 }, { "shortName": "Name", "name": "string Sooloos.Broker.Api.NugsVenue::Name", "propType": 20 }],
  "Sooloos.Broker.Api.NugsSong": [{ "shortName": "Title", "name": "string Sooloos.Broker.Api.NugsSong::Title", "propType": 20 }],
  "Sooloos.Broker.Api.CIFSShare": [{ "shortName": "ShareName", "name": "string Sooloos.Broker.Api.CIFSShare::ShareName", "propType": 20 }],
  "Sooloos.Broker.Api.CIFSConfig": [{ "shortName": "NetworkPath", "name": "string Sooloos.Broker.Api.CIFSConfig::NetworkPath", "propType": 20 }, { "shortName": "Username", "name": "string Sooloos.Broker.Api.CIFSConfig::Username", "propType": 20 }, { "shortName": "Password", "name": "string Sooloos.Broker.Api.CIFSConfig::Password", "propType": 20 }, { "shortName": "Workgroup", "name": "string Sooloos.Broker.Api.CIFSConfig::Workgroup", "propType": 20 }],
  "Sooloos.Broker.Api.GetDrivesOptions": [{ "shortName": "EnableDropbox", "name": "bool Sooloos.Broker.Api.GetDrivesOptions::EnableDropbox", "propType": 2 }, { "shortName": "EnableShares", "name": "bool Sooloos.Broker.Api.GetDrivesOptions::EnableShares", "propType": 2 }, { "shortName": "EnableAttached", "name": "bool Sooloos.Broker.Api.GetDrivesOptions::EnableAttached", "propType": 2 }],
  "Sooloos.Broker.Api.GetEntriesOptions": [],
  "Sooloos.Broker.Api.SharingQuote": [{ "shortName": "Quote", "name": "string Sooloos.Broker.Api.SharingQuote::Quote", "propType": 20 }, { "shortName": "Author", "name": "string Sooloos.Broker.Api.SharingQuote::Author", "propType": 20 }],
  "Sooloos.Broker.Api.SharingRelatedArtist": [{ "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerBase Sooloos.Broker.Api.SharingRelatedArtist::Performer", "propType": 23 }, { "shortName": "Relationship", "name": "string Sooloos.Broker.Api.SharingRelatedArtist::Relationship", "propType": 20 }],
  "Sooloos.Broker.Api.SharingArtistContent": [{ "shortName": "Header", "name": "string Sooloos.Broker.Api.SharingArtistContent::Header", "propType": 20 }, { "shortName": "Content", "name": "string Sooloos.Broker.Api.SharingArtistContent::Content", "propType": 20 }],
  "Sooloos.Broker.Api.SharingCredit": [{ "shortName": "Performer", "name": "Sooloos.Broker.Api.PerformerBase Sooloos.Broker.Api.SharingCredit::Performer", "propType": 23 }, { "shortName": "Role", "name": "string Sooloos.Broker.Api.SharingCredit::Role", "propType": 20 }],
  "Sooloos.Broker.Api.ImageShareParameters": [],
  "Sooloos.Broker.Api.GenerateTrackImageParameters": [{ "shortName": "Track", "name": "Sooloos.Broker.Api.TrackBase Sooloos.Broker.Api.GenerateTrackImageParameters::Track", "propType": 23 }, { "shortName": "ArtistName", "name": "string Sooloos.Broker.Api.GenerateTrackImageParameters::ArtistName", "propType": 20 }, { "shortName": "AlbumTitle", "name": "string Sooloos.Broker.Api.GenerateTrackImageParameters::AlbumTitle", "propType": 20 }, { "shortName": "TrackTitle", "name": "string Sooloos.Broker.Api.GenerateTrackImageParameters::TrackTitle", "propType": 20 }, { "shortName": "Date", "name": "string Sooloos.Broker.Api.GenerateTrackImageParameters::Date", "propType": 20 }, { "shortName": "Location", "name": "string Sooloos.Broker.Api.GenerateTrackImageParameters::Location", "propType": 20 }, { "shortName": "Quote", "name": "Sooloos.Broker.Api.SharingQuote Sooloos.Broker.Api.GenerateTrackImageParameters::Quote", "propType": 23 }, { "shortName": "Credits", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SharingCredit> Sooloos.Broker.Api.GenerateTrackImageParameters::Credits", "propType": 23 }, { "shortName": "Lyrics", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.GenerateTrackImageParameters::Lyrics", "propType": 23 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.GenerateTrackImageParameters::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.GenerateAlbumImageParameters": [{ "shortName": "Album", "name": "Sooloos.Broker.Api.AlbumBase Sooloos.Broker.Api.GenerateAlbumImageParameters::Album", "propType": 23 }, { "shortName": "ArtistName", "name": "string Sooloos.Broker.Api.GenerateAlbumImageParameters::ArtistName", "propType": 20 }, { "shortName": "AlbumTitle", "name": "string Sooloos.Broker.Api.GenerateAlbumImageParameters::AlbumTitle", "propType": 20 }, { "shortName": "Rating", "name": "int? Sooloos.Broker.Api.GenerateAlbumImageParameters::Rating", "propType": 10 }, { "shortName": "Date", "name": "string Sooloos.Broker.Api.GenerateAlbumImageParameters::Date", "propType": 20 }, { "shortName": "Quote", "name": "Sooloos.Broker.Api.SharingQuote Sooloos.Broker.Api.GenerateAlbumImageParameters::Quote", "propType": 23 }, { "shortName": "Credits", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SharingCredit> Sooloos.Broker.Api.GenerateAlbumImageParameters::Credits", "propType": 23 }, { "shortName": "Genres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.GenerateAlbumImageParameters::Genres", "propType": 23 }, { "shortName": "AddReview", "name": "bool Sooloos.Broker.Api.GenerateAlbumImageParameters::AddReview", "propType": 2 }, { "shortName": "ReviewText", "name": "string Sooloos.Broker.Api.GenerateAlbumImageParameters::ReviewText", "propType": 20 }, { "shortName": "Location", "name": "string Sooloos.Broker.Api.GenerateAlbumImageParameters::Location", "propType": 20 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.GenerateAlbumImageParameters::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.GenerateArtistImageParameters": [{ "shortName": "Artist", "name": "Sooloos.Broker.Api.PerformerBase Sooloos.Broker.Api.GenerateArtistImageParameters::Artist", "propType": 23 }, { "shortName": "ArtistName", "name": "string Sooloos.Broker.Api.GenerateArtistImageParameters::ArtistName", "propType": 20 }, { "shortName": "Quote", "name": "Sooloos.Broker.Api.SharingQuote Sooloos.Broker.Api.GenerateArtistImageParameters::Quote", "propType": 23 }, { "shortName": "Albums", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.AlbumBase> Sooloos.Broker.Api.GenerateArtistImageParameters::Albums", "propType": 23 }, { "shortName": "Similar", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SharingRelatedArtist> Sooloos.Broker.Api.GenerateArtistImageParameters::Similar", "propType": 23 }, { "shortName": "Genres", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.GenerateArtistImageParameters::Genres", "propType": 23 }, { "shortName": "Contents", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SharingArtistContent> Sooloos.Broker.Api.GenerateArtistImageParameters::Contents", "propType": 23 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.GenerateArtistImageParameters::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.TranslateShareLinkResponse": [{ "shortName": "AlbumId", "name": "long? Sooloos.Broker.Api.TranslateShareLinkResponse::AlbumId", "propType": 11 }, { "shortName": "TrackId", "name": "long? Sooloos.Broker.Api.TranslateShareLinkResponse::TrackId", "propType": 11 }, { "shortName": "ArtistId", "name": "long? Sooloos.Broker.Api.TranslateShareLinkResponse::ArtistId", "propType": 11 }, { "shortName": "ResolvePriority", "name": "int? Sooloos.Broker.Api.TranslateShareLinkResponse::ResolvePriority", "propType": 10 }, { "shortName": "ResolveStatus", "name": "string Sooloos.Broker.Api.TranslateShareLinkResponse::ResolveStatus", "propType": 20 }],
  "Sooloos.Broker.Api.Play": [{ "shortName": "ZoneId", "name": "System.Sooid Sooloos.Broker.Api.Play::ZoneId", "propType": 4 }, { "shortName": "ProfileId", "name": "System.Guid Sooloos.Broker.Api.Play::ProfileId", "propType": 3 }, { "shortName": "Seconds", "name": "int Sooloos.Broker.Api.Play::Seconds", "propType": 0 }, { "shortName": "Time", "name": "System.DateTime Sooloos.Broker.Api.Play::Time", "propType": 8 }, { "shortName": "BrokerId", "name": "System.Guid Sooloos.Broker.Api.Play::BrokerId", "propType": 3 }, { "shortName": "MediaId", "name": "long? Sooloos.Broker.Api.Play::MediaId", "propType": 11 }, { "shortName": "MetadataId", "name": "long? Sooloos.Broker.Api.Play::MetadataId", "propType": 11 }, { "shortName": "ContentId", "name": "long? Sooloos.Broker.Api.Play::ContentId", "propType": 11 }, { "shortName": "LibraryId", "name": "long? Sooloos.Broker.Api.Play::LibraryId", "propType": 11 }, { "shortName": "FileSignature", "name": "System.Byte[] Sooloos.Broker.Api.Play::FileSignature", "propType": 21 }],
  "Sooloos.Broker.Api.TrackSyncInfo": [{ "shortName": "TrackId", "name": "long Sooloos.Broker.Api.TrackSyncInfo::TrackId", "propType": 1 }, { "shortName": "Timestamp", "name": "long Sooloos.Broker.Api.TrackSyncInfo::Timestamp", "propType": 1 }, { "shortName": "RemoteUrlPath", "name": "string Sooloos.Broker.Api.TrackSyncInfo::RemoteUrlPath", "propType": 20 }, { "shortName": "LocalTrack", "name": "IMessage Sooloos.Broker.Api.TrackSyncInfo::LocalTrack", "propType": 23 }, { "shortName": "LocalImages", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ImageSyncInfo> Sooloos.Broker.Api.TrackSyncInfo::LocalImages", "propType": 23 }, { "shortName": "ModificationTime", "name": "long Sooloos.Broker.Api.TrackSyncInfo::ModificationTime", "propType": 1 }, { "shortName": "Signature", "name": "System.Byte[] Sooloos.Broker.Api.TrackSyncInfo::Signature", "propType": 21 }, { "shortName": "Metadata", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.MetadataSyncInfo> Sooloos.Broker.Api.TrackSyncInfo::Metadata", "propType": 23 }],
  "Sooloos.Broker.Api.MetadataSyncInfo": [{ "shortName": "MediaId", "name": "System.Sooid Sooloos.Broker.Api.MetadataSyncInfo::MediaId", "propType": 4 }, { "shortName": "Metadata", "name": "IMessage Sooloos.Broker.Api.MetadataSyncInfo::Metadata", "propType": 23 }, { "shortName": "Overlay", "name": "IMessage Sooloos.Broker.Api.MetadataSyncInfo::Overlay", "propType": 23 }, { "shortName": "Images", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.ImageSyncInfo> Sooloos.Broker.Api.MetadataSyncInfo::Images", "propType": 23 }],
  "Sooloos.Broker.Api.ImageSyncInfo": [{ "shortName": "Image", "name": "Sooloos.Broker.Api.Image Sooloos.Broker.Api.ImageSyncInfo::Image", "propType": 23 }, { "shortName": "Hash", "name": "System.Byte[] Sooloos.Broker.Api.ImageSyncInfo::Hash", "propType": 21 }],
  "Sooloos.Broker.Api.SyncSpec": [{ "shortName": "Tracks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SyncTrackSpec> Sooloos.Broker.Api.SyncSpec::Tracks", "propType": 23 }, { "shortName": "Playlists", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.SyncPlaylistSpec> Sooloos.Broker.Api.SyncSpec::Playlists", "propType": 23 }],
  "Sooloos.Broker.Api.SyncTrackSpec": [{ "shortName": "TrackId", "name": "long Sooloos.Broker.Api.SyncTrackSpec::TrackId", "propType": 1 }, { "shortName": "Timestamp", "name": "long Sooloos.Broker.Api.SyncTrackSpec::Timestamp", "propType": 1 }, { "shortName": "SyncTimestamp", "name": "System.DateTime Sooloos.Broker.Api.SyncTrackSpec::SyncTimestamp", "propType": 8 }],
  "Sooloos.Broker.Api.SyncPlaylistSpec": [{ "shortName": "PlaylistId", "name": "System.Sooid Sooloos.Broker.Api.SyncPlaylistSpec::PlaylistId", "propType": 4 }, { "shortName": "Name", "name": "string Sooloos.Broker.Api.SyncPlaylistSpec::Name", "propType": 20 }, { "shortName": "Description", "name": "string Sooloos.Broker.Api.SyncPlaylistSpec::Description", "propType": 20 }, { "shortName": "Timestamp", "name": "long Sooloos.Broker.Api.SyncPlaylistSpec::Timestamp", "propType": 1 }, { "shortName": "TrackIds", "name": "System.Collections.Generic.IList<long> Sooloos.Broker.Api.SyncPlaylistSpec::TrackIds", "propType": 23 }],
  "Sooloos.Broker.Api.WorkBrowserSpec": [{ "shortName": "Grouping", "name": "string Sooloos.Broker.Api.WorkBrowserSpec::Grouping", "propType": 20 }, { "shortName": "Ordering", "name": "string Sooloos.Broker.Api.WorkBrowserSpec::Ordering", "propType": 20 }, { "shortName": "CatalogNumberingSystem", "name": "string Sooloos.Broker.Api.WorkBrowserSpec::CatalogNumberingSystem", "propType": 20 }, { "shortName": "OrderingIsAscending", "name": "bool? Sooloos.Broker.Api.WorkBrowserSpec::OrderingIsAscending", "propType": 12 }, { "shortName": "Filter", "name": "Sooloos.Broker.Api.WorkBrowserFilter Sooloos.Broker.Api.WorkBrowserSpec::Filter", "propType": 23 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkBrowserSpec::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.WorkBrowserFilter": [{ "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.WorkBrowserFilter::TextFilter", "propType": 20 }, { "shortName": "RequireInLibrary", "name": "bool Sooloos.Broker.Api.WorkBrowserFilter::RequireInLibrary", "propType": 2 }, { "shortName": "ExcludeInLibrary", "name": "bool Sooloos.Broker.Api.WorkBrowserFilter::ExcludeInLibrary", "propType": 2 }, { "shortName": "RequireIsFavorite", "name": "bool Sooloos.Broker.Api.WorkBrowserFilter::RequireIsFavorite", "propType": 2 }, { "shortName": "ExcludeIsFavorite", "name": "bool Sooloos.Broker.Api.WorkBrowserFilter::ExcludeIsFavorite", "propType": 2 }, { "shortName": "PeriodsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.WorkBrowserFilter::PeriodsMode", "propType": 9 }, { "shortName": "RequirePeriods", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkBrowserFilter::RequirePeriods", "propType": 23 }, { "shortName": "ExcludePeriods", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkBrowserFilter::ExcludePeriods", "propType": 23 }, { "shortName": "FormsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.WorkBrowserFilter::FormsMode", "propType": 9 }, { "shortName": "RequireForms", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkBrowserFilter::RequireForms", "propType": 23 }, { "shortName": "ExcludeForms", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkBrowserFilter::ExcludeForms", "propType": 23 }, { "shortName": "InstrumentationsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.WorkBrowserFilter::InstrumentationsMode", "propType": 9 }, { "shortName": "RequireInstrumentations", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkBrowserFilter::RequireInstrumentations", "propType": 23 }, { "shortName": "ExcludeInstrumentations", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.WorkBrowserFilter::ExcludeInstrumentations", "propType": 23 }],
  "Sooloos.Broker.Api.AlbumBrowserSpec": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.AlbumBrowserSpec::UiLanguage", "propType": 20 }, { "shortName": "DiscographyVersion", "name": "int Sooloos.Broker.Api.AlbumBrowserSpec::DiscographyVersion", "propType": 0 }, { "shortName": "Grouping", "name": "string Sooloos.Broker.Api.AlbumBrowserSpec::Grouping", "propType": 20 }, { "shortName": "Ordering", "name": "string Sooloos.Broker.Api.AlbumBrowserSpec::Ordering", "propType": 20 }, { "shortName": "OrderingIsAscending", "name": "bool? Sooloos.Broker.Api.AlbumBrowserSpec::OrderingIsAscending", "propType": 12 }, { "shortName": "Filter", "name": "Sooloos.Broker.Api.AlbumBrowserFilter Sooloos.Broker.Api.AlbumBrowserSpec::Filter", "propType": 23 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.AlbumBrowserSpec::IncludeHidden", "propType": 2 }, { "shortName": "DisableEquivalenceBasedDuplicateHandling", "name": "bool Sooloos.Broker.Api.AlbumBrowserSpec::DisableEquivalenceBasedDuplicateHandling", "propType": 2 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserSpec::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.AlbumBrowserFilter": [{ "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.AlbumBrowserFilter::TextFilter", "propType": 20 }, { "shortName": "RequireInLibrary", "name": "bool Sooloos.Broker.Api.AlbumBrowserFilter::RequireInLibrary", "propType": 2 }, { "shortName": "ExcludeInLibrary", "name": "bool Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeInLibrary", "propType": 2 }, { "shortName": "RequireIsFavorite", "name": "bool Sooloos.Broker.Api.AlbumBrowserFilter::RequireIsFavorite", "propType": 2 }, { "shortName": "ExcludeIsFavorite", "name": "bool Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeIsFavorite", "propType": 2 }, { "shortName": "RequireIsPlayed", "name": "bool Sooloos.Broker.Api.AlbumBrowserFilter::RequireIsPlayed", "propType": 2 }, { "shortName": "ExcludeIsPlayed", "name": "bool Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeIsPlayed", "propType": 2 }, { "shortName": "RequireIsLive", "name": "bool Sooloos.Broker.Api.AlbumBrowserFilter::RequireIsLive", "propType": 2 }, { "shortName": "ExcludeIsLive", "name": "bool Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeIsLive", "propType": 2 }, { "shortName": "RequireQualities", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserFilter::RequireQualities", "propType": 23 }, { "shortName": "ExcludeQualities", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeQualities", "propType": 23 }, { "shortName": "RequireGroups", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserFilter::RequireGroups", "propType": 23 }, { "shortName": "ExcludeGroups", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeGroups", "propType": 23 }, { "shortName": "RequireSources", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.MediaSource> Sooloos.Broker.Api.AlbumBrowserFilter::RequireSources", "propType": 23 }, { "shortName": "ExcludeSources", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.MediaSource> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeSources", "propType": 23 }, { "shortName": "GenresMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumBrowserFilter::GenresMode", "propType": 9 }, { "shortName": "RequireGenres", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.AlbumBrowserFilter::RequireGenres", "propType": 23 }, { "shortName": "ExcludeGenres", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeGenres", "propType": 23 }, { "shortName": "RolesMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumBrowserFilter::RolesMode", "propType": 9 }, { "shortName": "RequireRoles", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserFilter::RequireRoles", "propType": 23 }, { "shortName": "ExcludeRoles", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeRoles", "propType": 23 }, { "shortName": "ComposersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumBrowserFilter::ComposersMode", "propType": 9 }, { "shortName": "RequireComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::RequireComposers", "propType": 23 }, { "shortName": "ExcludeComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeComposers", "propType": 23 }, { "shortName": "ConductorsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumBrowserFilter::ConductorsMode", "propType": 9 }, { "shortName": "RequireConductors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::RequireConductors", "propType": 23 }, { "shortName": "ExcludeConductors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeConductors", "propType": 23 }, { "shortName": "ProducersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumBrowserFilter::ProducersMode", "propType": 9 }, { "shortName": "RequireProducers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::RequireProducers", "propType": 23 }, { "shortName": "ExcludeProducers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeProducers", "propType": 23 }, { "shortName": "EnsemblesMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumBrowserFilter::EnsemblesMode", "propType": 9 }, { "shortName": "RequireEnsembles", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::RequireEnsembles", "propType": 23 }, { "shortName": "ExcludeEnsembles", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeEnsembles", "propType": 23 }, { "shortName": "PerformersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumBrowserFilter::PerformersMode", "propType": 9 }, { "shortName": "RequirePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::RequirePerformers", "propType": 23 }, { "shortName": "ExcludePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludePerformers", "propType": 23 }, { "shortName": "LabelsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.AlbumBrowserFilter::LabelsMode", "propType": 9 }, { "shortName": "RequireLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserFilter::RequireLabels", "propType": 23 }, { "shortName": "ExcludeLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.AlbumBrowserFilter::ExcludeLabels", "propType": 23 }],
  "Sooloos.Broker.Api.TrackBrowserSpec": [{ "shortName": "UiLanguage", "name": "string Sooloos.Broker.Api.TrackBrowserSpec::UiLanguage", "propType": 20 }, { "shortName": "Grouping", "name": "string Sooloos.Broker.Api.TrackBrowserSpec::Grouping", "propType": 20 }, { "shortName": "Ordering", "name": "string Sooloos.Broker.Api.TrackBrowserSpec::Ordering", "propType": 20 }, { "shortName": "OrderingIsAscending", "name": "bool? Sooloos.Broker.Api.TrackBrowserSpec::OrderingIsAscending", "propType": 12 }, { "shortName": "Filter", "name": "Sooloos.Broker.Api.TrackBrowserFilter Sooloos.Broker.Api.TrackBrowserSpec::Filter", "propType": 23 }, { "shortName": "IncludeHidden", "name": "bool Sooloos.Broker.Api.TrackBrowserSpec::IncludeHidden", "propType": 2 }, { "shortName": "LanguagePreferences", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserSpec::LanguagePreferences", "propType": 23 }],
  "Sooloos.Broker.Api.TrackBrowserFilter": [{ "shortName": "TextFilter", "name": "string Sooloos.Broker.Api.TrackBrowserFilter::TextFilter", "propType": 20 }, { "shortName": "RequireInLibrary", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::RequireInLibrary", "propType": 2 }, { "shortName": "ExcludeInLibrary", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::ExcludeInLibrary", "propType": 2 }, { "shortName": "RequireIsCompletePerformance", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::RequireIsCompletePerformance", "propType": 2 }, { "shortName": "ExcludeIsCompletePerformance", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::ExcludeIsCompletePerformance", "propType": 2 }, { "shortName": "RequireIsFavorite", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::RequireIsFavorite", "propType": 2 }, { "shortName": "ExcludeIsFavorite", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::ExcludeIsFavorite", "propType": 2 }, { "shortName": "RequireIsPlayed", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::RequireIsPlayed", "propType": 2 }, { "shortName": "ExcludeIsPlayed", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::ExcludeIsPlayed", "propType": 2 }, { "shortName": "RequireIsLive", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::RequireIsLive", "propType": 2 }, { "shortName": "ExcludeIsLive", "name": "bool Sooloos.Broker.Api.TrackBrowserFilter::ExcludeIsLive", "propType": 2 }, { "shortName": "RequireQualities", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::RequireQualities", "propType": 23 }, { "shortName": "ExcludeQualities", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeQualities", "propType": 23 }, { "shortName": "SourcesMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::SourcesMode", "propType": 9 }, { "shortName": "RequireSources", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.MediaSource> Sooloos.Broker.Api.TrackBrowserFilter::RequireSources", "propType": 23 }, { "shortName": "ExcludeSources", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.MediaSource> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeSources", "propType": 23 }, { "shortName": "GenresMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::GenresMode", "propType": 9 }, { "shortName": "RequireGenres", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.TrackBrowserFilter::RequireGenres", "propType": 23 }, { "shortName": "ExcludeGenres", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.GenreLite> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeGenres", "propType": 23 }, { "shortName": "RolesMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::RolesMode", "propType": 9 }, { "shortName": "RequireRoles", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::RequireRoles", "propType": 23 }, { "shortName": "ExcludeRoles", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeRoles", "propType": 23 }, { "shortName": "WorksMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::WorksMode", "propType": 9 }, { "shortName": "RequireWorks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkLite> Sooloos.Broker.Api.TrackBrowserFilter::RequireWorks", "propType": 23 }, { "shortName": "ExcludeWorks", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.WorkLite> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeWorks", "propType": 23 }, { "shortName": "ComposersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::ComposersMode", "propType": 9 }, { "shortName": "RequireComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::RequireComposers", "propType": 23 }, { "shortName": "ExcludeComposers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeComposers", "propType": 23 }, { "shortName": "ConductorsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::ConductorsMode", "propType": 9 }, { "shortName": "RequireConductors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::RequireConductors", "propType": 23 }, { "shortName": "ExcludeConductors", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeConductors", "propType": 23 }, { "shortName": "ProducersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::ProducersMode", "propType": 9 }, { "shortName": "RequireProducers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::RequireProducers", "propType": 23 }, { "shortName": "ExcludeProducers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeProducers", "propType": 23 }, { "shortName": "EnsemblesMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::EnsemblesMode", "propType": 9 }, { "shortName": "RequireEnsembles", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::RequireEnsembles", "propType": 23 }, { "shortName": "ExcludeEnsembles", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeEnsembles", "propType": 23 }, { "shortName": "PerformersMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::PerformersMode", "propType": 9 }, { "shortName": "RequirePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::RequirePerformers", "propType": 23 }, { "shortName": "ExcludePerformers", "name": "System.Collections.Generic.IList<Sooloos.Broker.Api.PerformerLite> Sooloos.Broker.Api.TrackBrowserFilter::ExcludePerformers", "propType": 23 }, { "shortName": "LabelsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::LabelsMode", "propType": 9 }, { "shortName": "RequireLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::RequireLabels", "propType": 23 }, { "shortName": "ExcludeLabels", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeLabels", "propType": 23 }, { "shortName": "PeriodsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::PeriodsMode", "propType": 9 }, { "shortName": "RequirePeriods", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::RequirePeriods", "propType": 23 }, { "shortName": "ExcludePeriods", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::ExcludePeriods", "propType": 23 }, { "shortName": "FormsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::FormsMode", "propType": 9 }, { "shortName": "RequireForms", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::RequireForms", "propType": 23 }, { "shortName": "ExcludeForms", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeForms", "propType": 23 }, { "shortName": "InstrumentationsMode", "name": "Sooloos.Broker.Api.CriteriaMode Sooloos.Broker.Api.TrackBrowserFilter::InstrumentationsMode", "propType": 9 }, { "shortName": "RequireInstrumentations", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::RequireInstrumentations", "propType": 23 }, { "shortName": "ExcludeInstrumentations", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.TrackBrowserFilter::ExcludeInstrumentations", "propType": 23 }],
  "Sooloos.Broker.Api.EditList<string>": [{ "shortName": "ClearBaseValue", "name": "bool? Sooloos.Broker.Api.EditList<string>::ClearBaseValue", "propType": 12 }, { "shortName": "ClearEdits", "name": "bool Sooloos.Broker.Api.EditList<string>::ClearEdits", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditList<string>::PreferLocalValue", "propType": 12 }, { "shortName": "ClearPreferLocalValue", "name": "bool Sooloos.Broker.Api.EditList<string>::ClearPreferLocalValue", "propType": 2 }, { "shortName": "AddValues", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.EditList<string>::AddValues", "propType": 24 }, { "shortName": "RemoveValues", "name": "System.Collections.Generic.IList<string> Sooloos.Broker.Api.EditList<string>::RemoveValues", "propType": 24 }],
  "Sooloos.Broker.Api.EditRequiredRef<string>": [{ "shortName": "ClearEdits", "name": "bool Sooloos.Broker.Api.EditRequiredRef<string>::ClearEdits", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditRequiredRef<string>::PreferLocalValue", "propType": 12 }, { "shortName": "ClearPreferLocalValue", "name": "bool Sooloos.Broker.Api.EditRequiredRef<string>::ClearPreferLocalValue", "propType": 2 }, { "shortName": "EditValue", "name": "string Sooloos.Broker.Api.EditRequiredRef<string>::EditValue", "propType": 20 }],
  "Sooloos.Broker.Api.EditOptionalVal<int>": [{ "shortName": "ClearBaseValue", "name": "bool? Sooloos.Broker.Api.EditOptionalVal<int>::ClearBaseValue", "propType": 12 }, { "shortName": "ClearEdits", "name": "bool Sooloos.Broker.Api.EditOptionalVal<int>::ClearEdits", "propType": 2 }, { "shortName": "PreferLocalValue", "name": "bool? Sooloos.Broker.Api.EditOptionalVal<int>::PreferLocalValue", "propType": 12 }, { "shortName": "ClearPreferLocalValue", "name": "bool Sooloos.Broker.Api.EditOptionalVal<int>::ClearPreferLocalValue", "propType": 2 }, { "shortName": "EditValue", "name": "int? Sooloos.Broker.Api.EditOptionalVal<int>::EditValue", "propType": 10 }]
};
function structSchema(typeName) {
  return Object.hasOwn(schemas, typeName) ? schemas[typeName] : void 0;
}

// ../deep-roon-mcp/src/intern/proto/structs.ts
function structArg(remoting, typeName, fields) {
  const members = structSchema(typeName) ?? fields;
  const used = /* @__PURE__ */ new Set();
  const entries = fields.map((field2) => {
    const index = members.findIndex((m) => m.name === field2.name || "shortName" in m && m.shortName === field2.name);
    if (index < 0) throw new Error(`unknown member ${field2.name} for ${typeName}`);
    if (members[index].propType !== field2.propType) throw new Error(`property type mismatch for ${typeName}::${field2.name}`);
    if (used.has(index)) throw new Error(`duplicate member ${field2.name} for ${typeName}`);
    used.add(index);
    return { index: index + 1, value: field2.value };
  });
  return inlineStruct(remoting.defineType(typeName, members), entries);
}

// ../deep-roon-mcp/src/intern/proto/client.ts
var ROOT_SERVICE_GUID = Buffer.from("bcd36e8478a3e111b2725b4a6188709b", "hex");
var RoonClient = class {
  conn;
  remoting;
  graph = new ObjectGraph();
  explicitProfile;
  cachedProfile;
  settleMs;
  /** Added 8 Oct 2026: a PING every 10 s while connected (see RemotingClient.ping); stops at the first failed one —
   *  a caller may replace conn.onclosed, so the close hook alone is not enough. */
  keepalive = null;
  constructor(opts) {
    this.conn = new RoonConnection({ host: opts.host, port: opts.port, serverBrokerId: opts.serverBrokerId });
    this.remoting = new RemotingClient(this.conn);
    this.remoting.onPush = (f) => this.graph.ingest(f);
    this.conn.onclosed = () => {
      this.stopKeepalive();
      this.remoting.failPending("broker connection closed");
    };
    this.explicitProfile = opts.profileSooid;
    this.settleMs = opts.settleMs ?? 2e3;
  }
  /**
   * The profile Sooid used by the library calls: the explicit option when
   * given, else read from the Profile object in the graph (available after
   * connect()). The old hardcoded default was one specific Core's profile id —
   * on every other Core the server matched nothing against it, which is a big
   * part of why search returned no results.
   */
  profile() {
    if (this.explicitProfile) return this.explicitProfile;
    if (this.cachedProfile) return this.cachedProfile;
    for (const o of this.graph.objects.values()) {
      if (!o.typeName.endsWith(".Profile")) continue;
      for (const [k, v] of Object.entries(o.fields)) {
        if (k.endsWith("::ProfileId") && Buffer.isBuffer(v)) {
          this.cachedProfile = v;
          return v;
        }
      }
    }
    throw new Error("no Profile object in the graph yet \u2014 connect() first, or pass profileSooid");
  }
  /** Connect, establish the remoting session, and load the object graph. */
  async connect() {
    await this.conn.connect();
    this.stopKeepalive();
    this.keepalive = setInterval(() => {
      this.remoting.ping().catch(() => this.stopKeepalive());
    }, 1e4);
    this.keepalive.unref?.();
    await this.remoting.getService(ROOT_SERVICE_GUID);
    await new Promise((r) => setTimeout(r, this.settleMs));
  }
  close() {
    this.stopKeepalive();
    this.remoting.failPending("client closed");
    this.conn.close();
  }
  stopKeepalive() {
    if (this.keepalive) {
      clearInterval(this.keepalive);
      this.keepalive = null;
    }
  }
  // --- object lookup ---
  serviceOid(name) {
    const o = this.graph.findByType(name)[0];
    if (!o) throw new Error(`service object "${name}" not found`);
    return o.oid;
  }
  strField(o, suffix) {
    for (const [k, v] of Object.entries(o.fields)) if (k.endsWith(suffix) && typeof v === "string") return v;
    return void 0;
  }
  /** Find a loaded object of a type by its Title/Name (case-insensitive). */
  findByTitle(typeName, title) {
    return this.graph.findByType(typeName).find((o) => {
      const t = this.strField(o, "::Title") ?? this.strField(o, "::Name");
      return t?.toLowerCase() === title.toLowerCase();
    });
  }
  /** Resolve a zone object id by the name of one of its endpoints. */
  zoneByName(name) {
    for (const e of this.graph.findByType("Endpoint")) {
      if (this.strField(e, "::Name")?.toLowerCase().includes(name.toLowerCase())) {
        for (const [k, v] of Object.entries(e.fields)) if (k.endsWith("::Zone") && isRef(v)) return v.$ref;
      }
    }
    return void 0;
  }
  /** Resolve an endpoint object id by name. */
  endpointByName(name) {
    const e = this.graph.findByType("Endpoint").find((x) => this.strField(x, "::Name")?.toLowerCase().includes(name.toLowerCase()));
    return e?.oid;
  }
  // --- generic call ---
  /** Call a method by service + name + params + pre-built args; returns the result. */
  call(service, method, params, args, objectId) {
    const sig = formatMethodSignature(service, method, params);
    return this.remoting.callMethod(objectId ?? this.serviceOid(service), sig, args);
  }
  /** Build a sparse value using the shared full schema and stable field indexes. */
  structArg(typeName, fields) {
    return structArg(this.remoting, typeName, fields);
  }
  /** ms to wait for UnifiedSearch result objects to stream into the graph. */
  searchSettleMs = 2e3;
  /**
   * Library::UnifiedSearch — library and streaming-catalog results.
   * Resolve only the callback's result graph. TopSearchResults keep the Core's
   * ranking, followed by highlighted albums and category lists in a stable
   * order. Version lists preserve their order; repeated OIDs appear once.
   * Opt in to playlist and genre hits with includePlaylistsAndGenres. Their
   * lists follow ranked hits/highlights and precede broad categories so large
   * performer lists do not consume the entire result limit first.
   */
  async search(terms, maxCount = 50, includePlaylistsAndGenres = false) {
    const params = this.structArg("Sooloos.Broker.Api.SearchParameters", [
      {
        name: "System.Sooid Sooloos.Broker.Api.SearchParameters::ProfileId",
        propType: 4 /* Sooid */,
        value: new BinaryWriter().sooid(this.profile()).toBuffer()
      },
      {
        name: "string Sooloos.Broker.Api.SearchParameters::Terms",
        propType: 20 /* String */,
        value: new BinaryWriter().string(terms).toBuffer()
      },
      {
        name: "int Sooloos.Broker.Api.SearchParameters::MaxCount",
        propType: 0 /* Int */,
        value: new BinaryWriter().integer(maxCount).toBuffer()
      },
      {
        name: "int Sooloos.Broker.Api.SearchParameters::MaxTopResultCount",
        propType: 0 /* Int */,
        value: new BinaryWriter().integer(20).toBuffer()
      }
    ]);
    const res = await this.call(
      "Library",
      "UnifiedSearch",
      [
        { type: "SearchParameters", name: "p" },
        { type: "ResultCallback<UnifiedSearchResults>", name: "cb" }
      ],
      params,
      this.serviceOid("Library")
    );
    if (!res.success) throw new Error(`UnifiedSearch failed: ${res.status}`);
    const result = this.graph.decodeReturnValue(Uint8Array.from(res.payload));
    const [, end] = readFlexLong(res.payload, 0);
    if (!isRef(result) || end !== res.payload.length || res.payload.length > 10) {
      throw new Error("UnifiedSearch returned an invalid result reference");
    }
    const deadline = Date.now() + this.searchSettleMs;
    for (; ; ) {
      const objects = this.searchResultObjects(result.$ref, includePlaylistsAndGenres);
      if (objects !== void 0) return objects.slice(0, Math.max(0, maxCount));
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw new Error("UnifiedSearch result graph is incomplete");
      await new Promise((resolve) => setTimeout(resolve, Math.min(10, remaining)));
    }
  }
  /** undefined means a referenced membership object has not arrived yet. */
  searchResultObjects(rootId, includePlaylistsAndGenres) {
    const root = this.graph.getObject(rootId);
    if (!root) return void 0;
    if (!root.typeName.endsWith(".UnifiedSearchResults")) {
      throw new Error("UnifiedSearch returned an unexpected result type");
    }
    const rootMembers = [
      "TopSearchResults",
      "TopAlbum",
      "TopLibraryAlbum",
      "Performers",
      "Composers",
      "Albums",
      "Tracks",
      "Works"
    ];
    const leaves = /* @__PURE__ */ new Set([
      "AlbumLite",
      "TrackLite",
      "PerformerLite",
      "WorkLite",
      "Album",
      "Track",
      "Performer",
      "Work"
    ]);
    if (includePlaylistsAndGenres) {
      rootMembers.splice(3, 0, "Playlists", "Genres");
      for (const type of ["Playlist", "BrowserGenre", "GenreLite"]) leaves.add(type);
    }
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    let complete = true;
    const member2 = (fields, name) => Object.entries(fields).find(([key]) => key.endsWith(`::${name}`))?.[1];
    const visit = (value) => {
      if (value === null || value === void 0) return;
      let type;
      let fields;
      if (isRef(value)) {
        if (seen.has(value.$ref)) return;
        seen.add(value.$ref);
        const object = this.graph.getObject(value.$ref);
        if (!object) {
          complete = false;
          return;
        }
        type = object.typeName;
        fields = object.fields;
        if (leaves.has(type.slice(type.lastIndexOf(".") + 1))) {
          out.push(object);
          return;
        }
      } else if (typeof value === "object" && "$type" in value) {
        fields = value;
        type = String(fields.$type);
      } else {
        complete = false;
        return;
      }
      if (/(^|\.)DataList</.test(type)) {
        const items2 = fields.$items;
        if (!Array.isArray(items2) || !Number.isInteger(fields.$count) || fields.$count < 0 || items2.length !== fields.$count) {
          complete = false;
          return;
        }
        for (const item of items2) visit(item);
      } else if (type.endsWith(".AlbumLiteVersions") || type.endsWith(".TrackLiteVersions")) {
        const items2 = member2(fields, type.endsWith(".AlbumLiteVersions") ? "Albums" : "Tracks");
        if (items2 === void 0) complete = false;
        else visit(items2);
      } else if (type.endsWith(".TopSearchResult")) {
        for (const name of [
          "Artist",
          "Album",
          "Track",
          "Work",
          "LibraryArtist",
          "LibraryAlbum",
          "LibraryTrack",
          "LibraryWork"
        ]) visit(member2(fields, name));
        if (includePlaylistsAndGenres) {
          for (const name of ["Playlist", "Genre"]) visit(member2(fields, name));
        }
      } else {
        complete = false;
      }
    };
    if (!Object.keys(root.fields).some((key) => rootMembers.some((name) => key.endsWith(`::${name}`)))) {
      return void 0;
    }
    for (const name of rootMembers) visit(member2(root.fields, name));
    return complete ? out : void 0;
  }
  /** Best-effort display title for a result object. */
  titleOf(o) {
    return this.strField(o, "::Title") ?? this.strField(o, "::Name") ?? "?";
  }
  /**
   * Search albums via VirtualAlbumQuery + RetainPage (the paged query path the
   * official client uses). Returns the AlbumLite objects on the first page.
   *   VirtualAlbumQuery(profile, criteria{TextFilter}, params{PageSize}) ->
   *   VirtualAlbumLiteQuery oid -> RetainPage(0) -> items push.
   */
  async searchAlbums(term, pageSize = 40) {
    const criteria = this.structArg("Sooloos.Broker.Api.AlbumQueryCriteria", [
      { name: "UiLanguage", propType: 20 /* String */, value: new BinaryWriter().string("en").toBuffer() },
      { name: "TextFilter", propType: 20 /* String */, value: new BinaryWriter().string(term).toBuffer() }
    ]);
    const params = this.structArg("Sooloos.Broker.Api.VirtualQueryParameters", [
      { name: "PageSize", propType: 0 /* Int */, value: new BinaryWriter().integer(pageSize).toBuffer() }
    ]);
    const args = Buffer.concat([buildArgs([Arg.sooid(this.profile())]), criteria, params]);
    const res = await this.call(
      "Library",
      "VirtualAlbumQuery",
      [
        { type: "Sooid", name: "profileid" },
        { type: "AlbumQueryCriteria", name: "criteria" },
        { type: "VirtualQueryParameters", name: "queryparams" },
        { type: "ResultCallback<VirtualAlbumLiteQuery>", name: "cb" }
      ],
      args,
      this.serviceOid("Library")
    );
    if (!res.success) throw new Error(`VirtualAlbumQuery failed: ${res.status}`);
    const [queryOid] = readFlexLong(Uint8Array.from(res.payload), 0);
    await new Promise((r) => setTimeout(r, 400));
    await this.call(
      "VirtualAlbumLiteQuery",
      "RetainPage",
      [
        { type: "int", name: "pagen" },
        { type: "ResultCallback", name: "cb" }
      ],
      buildArgs([Arg.int(0)]),
      queryOid
    );
    await new Promise((r) => setTimeout(r, 1500));
    const q = this.graph.getObject(queryOid);
    const items2 = q?.fields?.$items || [];
    const out = [];
    for (const it of items2) {
      const oid = isRef(it) ? it.$ref : void 0;
      const o = oid !== void 0 ? this.graph.getObject(oid) : void 0;
      if (o && this.strField(o, "::Title")) out.push(o);
    }
    if (!out.length) {
      const needle = term.toLowerCase();
      for (const o of this.graph.findByType("AlbumLite")) {
        const t = this.strField(o, "::Title");
        if (t && t.toLowerCase().includes(needle)) out.push(o);
      }
    }
    return out;
  }
  // --- typed convenience methods (proven live) ---
  /** Serialize one AlbumBase as an inline AlbumLink value struct {AlbumId, Broker}. */
  albumLink(albumId) {
    return this.structArg("Sooloos.Broker.Api.AlbumLink", [
      {
        name: "long Sooloos.Broker.Api.AlbumLink::AlbumId",
        propType: 1 /* Long */,
        value: new BinaryWriter().long(albumId).toBuffer()
      },
      {
        name: "Sooloos.Broker.Api.Broker Sooloos.Broker.Api.AlbumLink::Broker",
        propType: 23 /* Object */,
        value: new BinaryWriter().long(this.serviceOid("Broker")).toBuffer()
      }
    ]);
  }
  /**
   * Favorite/unfavorite an album (FavoriteBanState: None=0, Favorite=1, Ban=2).
   *
   * Takes the STABLE album id (albumIdOf), not a session oid. Uses the
   * IEnumerable<AlbumBase> overload the official client uses; each element is
   * an inline AlbumLink value struct {AlbumId, Broker}, and the collection is
   * length-prefixed (Arg.collection). Both facts came from a byte-for-byte
   * capture diff against the official client — the previous single-AlbumBase
   * call with a bare object ref was silently ignored, and encoding the
   * collection as a naive count+refs list stalls the Core.
   */
  favoriteAlbum(albumId, favorite) {
    return this.call(
      "Library",
      "FavoriteOrBan",
      [
        { type: "Sooid", name: "profileid" },
        { type: "IEnumerable<AlbumBase>", name: "albums" },
        { type: "FavoriteBanState", name: "state" },
        { type: "ResultCallback", name: "cb" }
      ],
      buildArgs([
        Arg.sooid(this.profile()),
        Arg.collection([this.albumLink(albumId)]),
        Arg.enum_(favorite ? 1 : 0)
      ]),
      this.serviceOid("Library")
    );
  }
  /** Play an album on a zone (default PlayParameters). */
  async playAlbum(zoneOid, albumOid) {
    const args = Buffer.concat([
      buildArgs([Arg.ref(zoneOid), Arg.sooid(this.profile())]),
      this.structArg("Sooloos.Broker.Api.PlayParameters", []),
      buildArgs([Arg.ref(albumOid), Arg.bool(false), Arg.bool(false)])
    ]);
    return this.call(
      "Transport",
      "PlayAlbum",
      [
        { type: "Zone", name: "zone" },
        { type: "Sooid", name: "profileid" },
        { type: "PlayParameters", name: "parameters" },
        { type: "AlbumBase", name: "album" },
        { type: "bool", name: "favoritesonly" },
        { type: "bool", name: "includehidden" },
        { type: "ResultCallback<PlayFeedback>", name: "cb" }
      ],
      args,
      this.serviceOid("Transport")
    );
  }
  /** Play a single track on a zone (default PlayParameters). */
  async playTrack(zoneOid, trackOid) {
    const args = Buffer.concat([
      buildArgs([Arg.ref(zoneOid), Arg.sooid(this.profile())]),
      this.structArg("Sooloos.Broker.Api.PlayParameters", []),
      buildArgs([Arg.ref(trackOid)])
    ]);
    return this.call(
      "Transport",
      "PlayTrack",
      [
        { type: "Zone", name: "zone" },
        { type: "Sooid", name: "profileid" },
        { type: "PlayParameters", name: "parameters" },
        { type: "TrackBase", name: "track" },
        { type: "ResultCallback<PlayFeedback>", name: "cb" }
      ],
      args,
      this.serviceOid("Transport")
    );
  }
  /** Convenience: find an album by title and play it on a named zone. */
  async playAlbumOnZone(zoneName, albumTitle) {
    const zone = this.zoneByName(zoneName);
    const album2 = this.findByTitle("AlbumLite", albumTitle) ?? this.findByTitle("Album", albumTitle);
    if (!zone) throw new Error(`zone "${zoneName}" not found`);
    if (!album2) throw new Error(`album "${albumTitle}" not loaded`);
    return this.playAlbum(zone, album2.oid);
  }
  /** Fire-and-forget zone transport control (Pause/Play/Stop/Next/Previous/...). */
  zoneControl(zoneOid, method) {
    this.remoting.callMethodNoReply(zoneOid, formatMethodSignature("Zone", method, []), Buffer.alloc(0));
  }
  /** Power a device off (standby) — fire-and-forget on the endpoint. */
  standby(endpointOid) {
    this.remoting.callMethodNoReply(endpointOid, formatMethodSignature("Endpoint", "Standby", []), Buffer.alloc(0));
  }
  /** Power a device on (convenience switch) — expects a response. */
  powerOn(endpointOid) {
    return this.remoting.callMethod(
      endpointOid,
      formatMethodSignature("Endpoint", "ConvenienceSwitch", [{ type: "ResultCallback", name: "cb" }]),
      Buffer.alloc(0)
    );
  }
  // --- metadata editing: read side (Phase E) ---
  /**
   * Read an album's editable metadata via Library::GetAlbumEditInfo. The result
   * is returned by-value (an inline AlbumEditInfo struct of Edit*Info<T> wrappers,
   * NOT pushed into the graph), so we decode it from the response payload. Each
   * field exposes its effective `Value`/`Values` plus whether the user has a local
   * edit layer. Proven live (read-only, safe). See docs Phase E.
   */
  async getAlbumEditInfo(albumOid) {
    const res = await this.call(
      "Library",
      "GetAlbumEditInfo",
      [
        { type: "AlbumBase", name: "album" },
        { type: "ResultCallback<AlbumEditInfo>", name: "cb" }
      ],
      buildArgs([Arg.ref(albumOid)]),
      this.serviceOid("Library")
    );
    if (!res.success) throw new Error(`GetAlbumEditInfo failed: ${res.status}`);
    const decoded = this.graph.decodeReturnValue(Uint8Array.from(res.payload));
    return parseAlbumEditInfo(decoded);
  }
  // --- metadata editing: write side (Phase E) ---
  /**
   * Edit an album's metadata via Library::Edit. **Proven live & reversible** for
   * title, rating, genres and labels (set then call again with the prior values to
   * restore). `albumId` is the AlbumLite::AlbumId long (see albumIdOf), NOT the oid.
   *
   * Encoding (validated against the live core): a LibraryEdit by-value struct whose
   * Albums is an IList<AlbumEdit> (LengthPrefixed: int(len)+flexInt(count)+items);
   * each AlbumEdit member uses a nested Edit*<T> wrapper (EditRequiredRef<string>
   * for Title, EditOptionalVal<int> for Rating, EditList<string> for Genres/Labels).
   *
   * NOTE: boolean flags (IsPick/IsUserHidden/IsCompilation/…) are intentionally not
   * supported — the core does not respond to EditOptionalVal<bool> edits (the apply
   * hangs server-side; the encoding is correct). Genres/labels must be values Roon
   * recognises; unknown strings return Success but are silently dropped.
   */
  editAlbum(albumId, edits) {
    const fields = [];
    if (edits.title !== void 0) {
      const w = this.structArg(EDIT_REQUIRED_REF_STR, [
        { name: `string ${EDIT_REQUIRED_REF_STR}::EditValue`, propType: 20 /* String */, value: new BinaryWriter().string(edits.title).toBuffer() }
      ]);
      fields.push({ name: `${EDIT_REQUIRED_REF_STR} ${ALBUM_EDIT}::Title`, propType: 23 /* Object */, value: w });
    }
    if (edits.rating !== void 0) {
      const w = this.structArg(EDIT_OPTIONAL_VAL_INT, [
        { name: `int? ${EDIT_OPTIONAL_VAL_INT}::EditValue`, propType: 10 /* NullableInt */, value: new BinaryWriter().boolean(true).integer(edits.rating).toBuffer() }
      ]);
      fields.push({ name: `${EDIT_OPTIONAL_VAL_INT} ${ALBUM_EDIT}::Rating`, propType: 23 /* Object */, value: w });
    }
    if (edits.addGenres || edits.removeGenres) {
      fields.push({ name: `${EDIT_LIST_STR} ${ALBUM_EDIT}::Genres`, propType: 23 /* Object */, value: this.editListStr(edits.addGenres ?? [], edits.removeGenres ?? []) });
    }
    if (edits.addLabels || edits.removeLabels) {
      fields.push({ name: `${EDIT_LIST_STR} ${ALBUM_EDIT}::Labels`, propType: 23 /* Object */, value: this.editListStr(edits.addLabels ?? [], edits.removeLabels ?? []) });
    }
    if (!fields.length) throw new Error("editAlbum: no edits supplied");
    return this.editAlbumStruct(albumId, fields);
  }
  /** Convenience: set just an album's rating (see editAlbum). */
  editAlbumRating(albumId, rating) {
    return this.editAlbum(albumId, { rating });
  }
  /** AlbumLite::AlbumId (the long id Library::Edit keys on). */
  albumIdOf(album2) {
    for (const [k, v] of Object.entries(album2.fields)) {
      if (k.endsWith("::AlbumId")) return typeof v === "bigint" ? v : BigInt(String(v));
    }
    return void 0;
  }
  /** Build an EditList<string> wrapper value (AddValues/RemoveValues). */
  editListStr(add, remove) {
    const list = (xs) => {
      const w = new BinaryWriter().flexInt(xs.length);
      for (const x of xs) w.string(x);
      const b = w.toBuffer();
      return new BinaryWriter().integer(b.length).bytes(b).toBuffer();
    };
    return this.structArg(EDIT_LIST_STR, [
      { name: `System.Collections.Generic.IList<string> ${EDIT_LIST_STR}::AddValues`, propType: 24 /* LengthPrefixed */, value: list(add) },
      { name: `System.Collections.Generic.IList<string> ${EDIT_LIST_STR}::RemoveValues`, propType: 24 /* LengthPrefixed */, value: list(remove) }
    ]);
  }
  /** Build + send a single-album Library::Edit from pre-serialized AlbumEdit member fields. */
  editAlbumStruct(albumId, fields) {
    const albumEdit = this.structArg(ALBUM_EDIT, [
      { name: `long ${ALBUM_EDIT}::AlbumId`, propType: 1 /* Long */, value: new BinaryWriter().long(albumId).toBuffer() },
      ...fields
    ]);
    const blob = new BinaryWriter().flexInt(1).bytes(albumEdit).toBuffer();
    const libraryEdit = this.structArg(LIBRARY_EDIT, [
      {
        name: `System.Collections.Generic.IList<${ALBUM_EDIT}> ${LIBRARY_EDIT}::Albums`,
        propType: 24 /* LengthPrefixed */,
        value: new BinaryWriter().integer(blob.length).bytes(blob).toBuffer()
      }
    ]);
    return this.call(
      "Library",
      "Edit",
      [{ type: "LibraryEdit", name: "edit" }, { type: "ResultCallback", name: "cb" }],
      libraryEdit,
      this.serviceOid("Library")
    );
  }
};
var ALBUM_EDIT = "Sooloos.Broker.Api.AlbumEdit";
var EDIT_OPTIONAL_VAL_INT = "Sooloos.Broker.Api.EditOptionalVal<int>";
var EDIT_REQUIRED_REF_STR = "Sooloos.Broker.Api.EditRequiredRef<string>";
var EDIT_LIST_STR = "Sooloos.Broker.Api.EditList<string>";
var LIBRARY_EDIT = "Sooloos.Broker.Api.LibraryEdit";
function member(obj2, suffix) {
  if (!obj2) return void 0;
  for (const [k, v] of Object.entries(obj2)) if (k.endsWith(suffix)) return v;
  return void 0;
}
function decodeStringList(v) {
  if (!Buffer.isBuffer(v)) return Array.isArray(v) ? v : void 0;
  const r = new BinaryReader(Uint8Array.from(v));
  const out = [];
  const count = r.flexInt();
  for (let i = 0; i < count && r.remaining > 0; i++) out.push(r.string() ?? "");
  return out;
}
function editField(info, fieldSuffix, list = false) {
  const wrapper = member(info, `::${fieldSuffix}`);
  const rawValue = member(wrapper, list ? "::Values" : "::Value");
  const rawMeta = member(wrapper, list ? "::MetadataValues" : "::MetadataValue");
  const value = list ? decodeStringList(rawValue) : rawValue;
  const metadataValue = list ? decodeStringList(rawMeta) : rawMeta;
  return { value, metadataValue, edited: member(wrapper, "::HasEditLayer") === true };
}
function parseAlbumEditInfo(decoded) {
  return {
    title: editField(decoded, "Title"),
    version: editField(decoded, "Version"),
    performedBy: editField(decoded, "PerformedBy"),
    genres: editField(decoded, "Genres", true),
    labels: editField(decoded, "Labels", true),
    rating: editField(decoded, "Rating"),
    type: editField(decoded, "Type"),
    isCompilation: editField(decoded, "IsCompilation"),
    isLive: editField(decoded, "IsLive"),
    isPick: editField(decoded, "IsPick"),
    containsExplicitContent: editField(decoded, "ContainsExplicitContent"),
    isUserHidden: editField(decoded, "IsUserHidden"),
    country: editField(decoded, "Country"),
    catalogNumber: editField(decoded, "CatalogNumber"),
    productCode: editField(decoded, "ProductCode"),
    raw: decoded
  };
}

// ../deep-roon-mcp/src/intern/history-export.ts
var TICKS_MASK = (1n << 62n) - 1n;

// ../deep-roon-mcp/src/core/discover.ts
var import_dgram = __toESM(require("dgram"));
var import_crypto = require("crypto");

// ../deep-roon-mcp/node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// ../deep-roon-mcp/src/core/discover.ts
var ROON_SERVICE_ID = "00720724-5143-4a9b-abac-0e50cba674bb";
var SOOD_PORT = 9003;
function soodQuery() {
  const parts = [Buffer.from("SOOD"), Buffer.from([2, "Q".charCodeAt(0)])];
  const property = (name, value) => {
    const n = Buffer.from(name), v = Buffer.from(value);
    parts.push(Buffer.from([n.length]), n, Buffer.from([v.length >> 8, v.length & 255]), v);
  };
  property("query_service_id", ROON_SERVICE_ID);
  property("_tid", (0, import_crypto.randomUUID)());
  return Buffer.concat(parts);
}
function soodReply(b) {
  if (b.length < 6 || b.toString("latin1", 0, 4) !== "SOOD" || b[4] !== 2 || b[5] !== "R".charCodeAt(0)) return null;
  const props = {};
  let i = 6;
  while (i < b.length) {
    const nl = b[i];
    i += 1;
    if (i + nl + 2 > b.length) return null;
    const name = b.toString("utf8", i, i + nl);
    i += nl;
    const vl = b[i] << 8 | b[i + 1];
    i += 2;
    if (vl === 65535) {
      props[name] = null;
      continue;
    }
    if (i + vl > b.length) return null;
    props[name] = b.toString("utf8", i, i + vl);
    i += vl;
  }
  return props;
}
function findCores(ms = 2500) {
  return new Promise((resolve) => {
    const found = /* @__PURE__ */ new Map();
    const socket = import_dgram.default.createSocket({ type: "udp4", reuseAddr: true });
    const done = () => {
      try {
        socket.close();
      } catch {
      }
      resolve([...found.values()]);
    };
    socket.on("error", done);
    socket.on("message", (msg, from) => {
      const p = soodReply(msg);
      if (!p || p.service_id !== ROON_SERVICE_ID) return;
      const id = p.unique_id ?? from.address;
      found.set(id, { host: from.address, port: Number(p.http_port ?? 9330) || 9330, name: p.name ?? void 0, version: p.display_version ?? void 0 });
    });
    socket.bind(0, () => {
      try {
        socket.setBroadcast(true);
        socket.setMulticastTTL(1);
      } catch {
      }
      const q = soodQuery();
      for (const target2 of ["239.255.90.90", "255.255.255.255"]) socket.send(q, SOOD_PORT, target2, () => {
      });
      setTimeout(done, ms);
    });
  });
}
function coreInfo(host, port = 9330, ms = 5e3) {
  return new Promise((resolve, reject) => {
    const ws = new wrapper_default(`ws://${host}:${port}/api`);
    const timer = setTimeout(() => {
      ws.terminate();
      reject(new Error(`no answer from the Roon Core at ${host}:${port}`));
    }, ms);
    const finish = (err, info) => {
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
      }
      err ? reject(err) : resolve(info);
    };
    ws.on("open", () => ws.send(Buffer.from("MOO/1 REQUEST com.roonlabs.registry:1/info\nRequest-Id: 0\n\n")));
    ws.on("message", (data) => {
      const text2 = Buffer.isBuffer(data) ? data.toString("utf8") : Array.isArray(data) ? Buffer.concat(data).toString("utf8") : Buffer.from(data).toString("utf8");
      const split = text2.indexOf("\n\n");
      const header = split >= 0 ? text2.slice(0, split) : text2;
      if (!/^MOO\/1 COMPLETE Success/.test(header) || !/^Request-Id: 0$/m.test(header)) return;
      try {
        const body = JSON.parse(text2.slice(split + 2));
        if (!body.core_id) return finish(new Error("the Roon Core gave no core_id"));
        finish(null, { coreId: String(body.core_id), name: String(body.display_name ?? "Roon Core"), version: String(body.display_version ?? "") });
      } catch (e) {
        finish(e);
      }
    });
    ws.on("error", (e) => finish(new Error(`can't reach the Roon Core at ${host}:${port} (${e.message})`)));
  });
}
function brokerId(coreId) {
  const hex = coreId.replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/i.test(hex)) throw new Error(`not a Roon core_id: ${coreId}`);
  const b = Buffer.from(hex, "hex");
  return Buffer.concat([Buffer.from(b.subarray(0, 4)).reverse(), Buffer.from(b.subarray(4, 6)).reverse(), Buffer.from(b.subarray(6, 8)).reverse(), b.subarray(8)]);
}

// ../deep-roon-mcp/src/core/errors.ts
var RoonError = class extends Error {
  constructor(message, kind = "roon") {
    super(message);
    this.kind = kind;
  }
  kind;
};

// intern/official.ts
var gekoppeld = false;
function zetGekoppeld(aan) {
  gekoppeld = aan;
}
function startOfficial(_target) {
}
async function paired() {
  if (gekoppeld) return true;
  throw new Error("Stacks is not enabled in Roon yet (Roon \u203A Settings \u203A Extensions)");
}

// ../deep-roon-mcp/src/core/log.ts
function log(...parts) {
  const d = /* @__PURE__ */ new Date(), t = (x) => String(x).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${t(d.getMonth() + 1)}-${t(d.getDate())} ${t(d.getHours())}:${t(d.getMinutes())}:${t(d.getSeconds())}`;
  process.stderr.write(`${stamp} deep-roon-mcp: ${parts.map(String).join(" ")}
`);
}

// ../deep-roon-mcp/src/core/session.ts
var IDLE_MS = 12e4;
var INTERNAL_PORT = 9332;
var target = null;
var client = null;
var idleTimer = null;
var queue = Promise.resolve();
var onFirstConnect = null;
var finding = null;
function findTarget() {
  if (target) return Promise.resolve(target);
  finding ??= locate().finally(() => {
    finding = null;
  });
  return finding;
}
async function locate() {
  const configured = process.env.ROON_HOST?.trim();
  let host, port;
  if (configured) {
    const m = /^\[?([^\]]+?)\]?(?::(\d+))?$/.exec(configured);
    host = m?.[1] ?? configured;
    port = Number(m?.[2] ?? 9330);
  } else {
    const cores = await findCores();
    if (!cores.length) {
      const mac = process.platform === "darwin" ? " On a Mac, check System Settings \u203A Privacy & Security \u203A Local Network: the app that runs Deep Roon MCP must be allowed (for Claude Desktop: Claude and Claude Helper)." : "";
      throw new RoonError(`No Roon Core found on this network.${mac} On another network (a VPN, Tailscale), set ROON_HOST to the Core's address.`, "unavailable");
    }
    if (cores.length > 1) log(`found ${cores.length} Roon Cores (${cores.map((c) => c.name ?? c.host).join(", ")}) \u2014 using ${cores[0].name ?? cores[0].host}; set ROON_HOST to choose`);
    host = cores[0].host;
    port = cores[0].port;
  }
  const info = await coreInfo(host, port);
  target = { host, port, info };
  log(`Roon Core: ${info.name} ${info.version} at ${host}`);
  startOfficial(target);
  return target;
}
function close(reason) {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  const c = client;
  client = null;
  if (c) {
    try {
      c.close();
    } catch {
    }
    log(`connection closed (${reason})`);
  }
}
async function open() {
  if (client) return client;
  const t = await findTarget();
  await paired();
  const c = new RoonClient({ host: t.host, port: INTERNAL_PORT, serverBrokerId: brokerId(t.info.coreId), settleMs: 1500 });
  c.conn.onclosed = () => {
    try {
      c.remoting.failPending("broker connection closed");
    } catch {
    }
    if (client === c) {
      client = null;
      log("connection closed by the Core");
    }
  };
  const t0 = Date.now();
  try {
    await c.connect();
  } catch (e) {
    target = null;
    throw new RoonError(`Can't connect to Roon's internal protocol at ${t.host}:${INTERNAL_PORT} (${e.message})`, "unavailable");
  }
  client = c;
  log(`connected to the Core in ${Date.now() - t0} ms \u2014 ${c.graph.objects.size} objects`);
  if (onFirstConnect) {
    const f = onFirstConnect;
    onFirstConnect = null;
    setTimeout(() => {
      f().catch(() => {
      });
    }, 0);
  }
  return c;
}
function withCore(work) {
  const task = queue.then(async () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    try {
      return await work(await open());
    } catch (e) {
      if (!(e instanceof RoonError && (e.kind === "not_found" || e.kind === "invalid"))) close("after an error");
      throw e;
    } finally {
      if (client) idleTimer = setTimeout(() => close("two minutes quiet"), IDLE_MS);
    }
  });
  queue = task.catch(() => {
  });
  return task;
}
function closeSoon(reason) {
  close(reason);
}
function shutdown() {
  close("shutting down");
}

// ../deep-roon-mcp/src/roon/graph.ts
function field(o, name) {
  if (!o) return void 0;
  const f = o.fields || o;
  for (const [k, v] of Object.entries(f)) if (k.endsWith("::" + name)) return v;
  return void 0;
}
var obj = (c, v) => isRef(v) ? c.graph.getObject(v.$ref) : v;
var clean = (s) => String(s ?? "").replace(/\[\[\d+\/?\|([^\]]*)\]\]/g, "$1").replace(/\[([^\]\[]+)\]\(\d+\)/g, "$1");
var items = (c, v) => (obj(c, v)?.fields?.$items ?? []).map((x) => obj(c, x)).filter(Boolean);
var strings = (c, v) => {
  const o = obj(c, v);
  return (o?.fields?.$items ?? o?.$items ?? []).filter((x) => typeof x === "string");
};
var flag = (v) => v === true || Buffer.isBuffer(v) && v.length > 1 && v[0] >= 1;
function imageKey(c, o, name = "Image") {
  const url = field(obj(c, field(o, name)), "Url");
  const m = /^broker:\/\/\/image\/([^.]+)\./.exec(String(url ?? ""));
  return m ? m[1] : void 0;
}
function dateParts(v) {
  if (!Buffer.isBuffer(v) || v.length < 2) return void 0;
  const n = new BinaryReader(Uint8Array.from(v)).flexInt();
  const y = n >>> 16, m = n >>> 8 & 255, d = n & 255;
  return y > 1e3 && y < 3e3 ? [y, m, d] : void 0;
}
var yearOf = (v) => dateParts(v)?.[0];
function dateText(v) {
  const p = dateParts(v);
  if (!p) return void 0;
  const [y, m, d] = p, t = (x) => String(x).padStart(2, "0");
  return m >= 1 && m <= 12 ? d >= 1 && d <= 31 ? `${y}-${t(m)}-${t(d)}` : `${y}-${t(m)}` : String(y);
}
function refList(payload) {
  if (!payload || payload.length < 2) return [];
  const r = new BinaryReader(Uint8Array.from(payload));
  r.integer();
  const n = r.flexInt();
  const refs = [];
  for (let i = 0; i < n && r.remaining > 0; i++) refs.push(BigInt(r.flexLong()));
  return refs;
}
var wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function untilLoaded(c, refs, ms = 2500) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (refs.every((x) => {
      if (!isRef(x)) return true;
      const o = c.graph.getObject(x.$ref);
      return field(o, "Title") !== void 0 || field(o, "Name") !== void 0;
    })) return;
    await wait(40);
  }
}
function short(p, ms = 4e3) {
  return Promise.race([p.catch(() => null), wait(ms).then(() => null)]);
}
function duration(seconds) {
  const s = Math.round(seconds), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}
function sourceOf(...os) {
  for (const o of os) {
    const v = field(o, "ContentSource") ?? field(o, "Source");
    if (v === 128) return "TIDAL";
    if (v === 256) return "Qobuz";
    if (v === 1) return "library";
  }
  return void 0;
}
var ALBUM_TYPES = ["main", "single", "compilation", "other", "unknown", "ep", "soundtrack", "show"];
function albumRow(c, o) {
  const fm = obj(c, field(o, "AlbumFormat"));
  const r = { kind: "album", key: String(field(o, "AlbumId") ?? ""), title: field(o, "Title") ?? "", artist: clean(field(o, "PerformedBy")), source: sourceOf(o) ?? (field(fm, "IsStreaming") === true ? "streaming" : "library") };
  const f = field(fm, "FormatString");
  if (f) r.format = f;
  const y = yearOf(field(o, "OriginalReleaseDate")) ?? yearOf(field(o, "ReleaseDate"));
  if (y) r.year = y;
  const st = field(o, "Rating");
  if (typeof st === "number" && st > 0) r.stars = st / 2;
  const lb = strings(c, field(o, "Labels"));
  if (lb.length) r.label = lb.join(" / ");
  const gs = strings(c, field(o, "Genres"));
  if (gs.length) r.genres = gs.slice(0, 8);
  if (field(o, "Source") === 1) r.in_library = true;
  if (flag(field(o, "IsFavorite"))) r.favorite = true;
  if (flag(field(o, "IsListenLater"))) r.listen_later = true;
  const p = field(o, "Popularity");
  if (typeof p === "number") r.popularity = Math.round(p * 100) / 100;
  const img = imageKey(c, o);
  if (img) r.image = img;
  const at = field(o, "Type");
  r.album_type = ALBUM_TYPES[typeof at === "number" ? at : 0] ?? "unknown";
  return r;
}
function trackArtist(c, r, tr, al) {
  const namen = [];
  for (const cr of items(c, field(tr, "Credits"))) {
    if (field(cr, "Type") !== 3) continue;
    const n = field(obj(c, field(cr, "Performer")), "Name");
    if (typeof n === "string" && n && !namen.includes(n)) namen.push(n);
  }
  const albumArtiest = clean(field(al, "PerformedBy") ?? "");
  if (!namen.length || namen.includes(albumArtiest) || namen.every((n) => albumArtiest.includes(n))) return;
  r.track_artist = namen.join(", ");
}

// ../deep-roon-mcp/src/roon/library.ts
var NONE = { types: [], args: Buffer.alloc(0) };
var library = (c) => c.serviceOid("Library");
async function findAlbum(c, key) {
  const inGraph = [...c.graph.objects.values()].find((o) => /\.Album(Lite)?$/.test(o.typeName) && String(field(o, "AlbumId") ?? "") === key && field(o, "Title") !== void 0);
  if (inGraph) return inGraph;
  if (!/^\d+$/.test(key)) throw new RoonError("An album key is a number", "invalid");
  const res = await short(c.call("Library", "GetAlbumLite", [{ type: "long", name: "albumid" }, { type: "ResultCallback<AlbumLite>", name: "cb_result" }], buildArgs([Arg.long(BigInt(key))]), library(c)));
  const v = res?.success && res.payload.length ? c.graph.decodeReturnValue(Uint8Array.from(res.payload)) : null;
  if (isRef(v)) {
    await untilLoaded(c, [v], 2e3);
    const o = c.graph.getObject(v.$ref);
    if (o && field(o, "Title") !== void 0) return o;
  }
  throw new RoonError(`Roon knows no album with key ${key}`, "not_found");
}
async function fullAlbum(c, al) {
  const res = await short(c.call("Library", "GetAlbum", [{ type: "AlbumBase", name: "album" }, { type: "ResultCallback<Album>", name: "cb_result" }], buildArgs([Arg.ref(al.oid)]), library(c)), 6e3);
  return res?.success && res.payload.length ? c.graph.decodeReturnValue(Uint8Array.from(res.payload)) : null;
}
var CREDIT_KIND = { 1: "composition", 2: "conductor", 3: "main artist", 4: "performance", 5: "ensemble", 6: "production" };
async function album(key, withCredits) {
  return withCore(async (c) => {
    const al = await findAlbum(c, key);
    let refs = [];
    const full = await fullAlbum(c, al);
    if (isRef(full)) {
      const end = Date.now() + 3500;
      while (Date.now() < end) {
        const list = obj(c, field(c.graph.getObject(full.$ref), "Tracks"))?.fields?.$items ?? [];
        if (list.length && list.every((x) => field(obj(c, x), "Title") !== void 0)) {
          refs = list.map((x) => x.$ref);
          break;
        }
        await wait(50);
      }
    }
    if (!refs.length) {
      const res = await short(c.call("Library", "GetAlbumTrackLites", [{ type: "AlbumBase", name: "album" }, { type: "ResultCallback<IList<TrackLite>>", name: "cb_result" }], buildArgs([Arg.ref(al.oid)]), library(c)));
      if (!res?.success) throw new RoonError(`The tracks of this album don't come (${res?.status ?? "no answer"})`);
      refs = refList(res.payload);
      await untilLoaded(c, refs.map((oid) => ({ $ref: oid })), 2500);
    }
    const raw = refs.map((oid) => c.graph.getObject(oid)).filter((t) => t && field(t, "Title") !== void 0);
    const discs = new Set(raw.map((t) => field(t, "MediaNumber") ?? 1)).size > 1;
    const formats = new Set(raw.map((t) => field(t, "Format"))).size > 1;
    let seconds = 0;
    const tracks = raw.map((t) => {
      const r = { key: String(field(t, "TrackId") ?? "") };
      if (discs) r.disc = field(t, "MediaNumber") ?? 1;
      const n = field(t, "TrackNumber");
      if (n != null) r.n = n;
      r.title = field(t, "Title");
      trackArtist(c, r, t, al);
      const l = field(t, "LengthSeconds");
      if (typeof l === "number") {
        r.length = duration(l);
        seconds += l;
      }
      if (formats && field(t, "Format")) r.format = field(t, "Format");
      if (flag(field(t, "IsFavorite"))) r.favorite = true;
      return r;
    });
    const out = { album: albumRow(c, al) };
    const main = items(c, field(al, "MainPerformers")).filter((p) => field(p, "Name"));
    if (main.length) out.artists = main.map((p) => ({ key: String(field(p, "PerformerId") ?? ""), name: field(p, "Name") }));
    if (seconds) out.length = duration(seconds);
    out.tracks = tracks;
    const A = isRef(full) ? c.graph.getObject(full.$ref) : null;
    const g = strings(c, field(al, "Genres"));
    if (g.length) out.genres = g;
    const released = dateText(field(al, "OriginalReleaseDate")), edition = dateText(field(al, "ReleaseDate"));
    if (released) out.released = released;
    if (edition && edition !== released) out.this_release = edition;
    const version = field(al, "Version");
    if (typeof version === "string" && version) out.version = version;
    for (const [k, name] of [["CatalogNumber", "catalogue_number"], ["ProductCode", "barcode"], ["Country", "country"]]) {
      const w = field(A, k);
      if (typeof w === "string" && w) out[name] = w;
    }
    for (const [k, name] of [["IsLive", "live"], ["IsCompilation", "compilation"], ["IsPick", "roon_pick"]]) if (field(al, k) === true) out[name] = true;
    if (withCredits && A) {
      const byRole = /* @__PURE__ */ new Map();
      for (const cr of items(c, field(A, "Credits"))) {
        const role = field(cr, "Role"), name = field(obj(c, field(cr, "Performer")), "Name");
        if (!role || !name) continue;
        const e = byRole.get(role) ?? { role, category: CREDIT_KIND[field(cr, "Type")] ?? void 0, names: [] };
        if (!e.names.includes(name)) e.names.push(name);
        byRole.set(role, e);
      }
      out.credits = [...byRole.values()];
    }
    return out;
  });
}

// ../deep-roon-mcp/src/roon/focus.ts
function albumTypeOf(x) {
  const k = x.toLowerCase().replace(/releases?|s$/g, "").replace(/[^a-z]/g, "");
  const alias = { mainrelease: "main", album: "main", extendedplay: "ep", ost: "soundtrack" };
  return ALBUM_TYPES.indexOf(alias[k] ?? k);
}
var intList = (xs) => {
  const w = new BinaryWriter().flexInt(xs.length);
  for (const x of xs) w.integer(x);
  const b = w.toBuffer();
  return new BinaryWriter().integer(b.length).bytes(b).toBuffer();
};
var textList = (xs) => {
  const w = new BinaryWriter().flexInt(xs.length);
  for (const x of xs) w.string(x);
  const b = w.toBuffer();
  return new BinaryWriter().integer(b.length).bytes(b).toBuffer();
};
var refList2 = (xs) => {
  const w = new BinaryWriter().flexInt(xs.length);
  for (const x of xs) w.long(x);
  const b = w.toBuffer();
  return new BinaryWriter().integer(b.length).bytes(b).toBuffer();
};
var maybeInt = (n) => new BinaryWriter().boolean(true).integer(n).toBuffer();
var dateValue = (y, m, d) => {
  const b = new BinaryWriter().flexInt(y << 16 | m << 8 | d).toBuffer();
  return new BinaryWriter().integer(b.length).bytes(b).toBuffer();
};
var yes = (name) => ({ name, propType: 2, value: new BinaryWriter().boolean(true).toBuffer() });
var text = (name, t) => ({ name, propType: 20, value: new BinaryWriter().string(t).toBuffer() });
var names = (v) => v.split(",").map((x) => x.trim()).filter(Boolean);
var english = () => text("UiLanguage", "en");
async function virtualQuery(c, kind, members, limit, offset, row) {
  const schema = structSchema(`Sooloos.Broker.Api.${kind}QueryCriteria`) ?? [];
  const missing = members.find((f) => !schema.some((m) => m.shortName === f.name));
  if (missing) throw new RoonError(`The filter ${missing.name} doesn't exist for ${kind.toLowerCase()}s in this Roon version`, "invalid");
  const size = Math.min(Math.max(1, limit), 100), page = Math.floor(Math.max(0, offset) / size);
  const criteria = c.structArg(`Sooloos.Broker.Api.${kind}QueryCriteria`, [english(), ...members]);
  const params = c.structArg("Sooloos.Broker.Api.VirtualQueryParameters", [{ name: "PageSize", propType: 0, value: new BinaryWriter().integer(size).toBuffer() }]);
  const res = await c.call(
    "Library",
    `Virtual${kind}Query`,
    [{ type: "Sooid", name: "profileid" }, { type: `${kind}QueryCriteria`, name: "criteria" }, { type: "VirtualQueryParameters", name: "queryparams" }, { type: `ResultCallback<Virtual${kind}LiteQuery>`, name: "cb_result" }],
    Buffer.concat([buildArgs([Arg.sooid(c.profile())]), criteria, params]),
    c.serviceOid("Library")
  );
  if (!res.success) throw new RoonError(`Roon refused the ${kind.toLowerCase()} query (${res.status})`);
  const v = c.graph.decodeReturnValue(Uint8Array.from(res.payload));
  if (!isRef(v)) throw new RoonError(`Roon's ${kind.toLowerCase()} query returned nothing`);
  const qoid = v.$ref, type = `Virtual${kind}LiteQuery`;
  const pageParams = [{ type: "int", name: "pagen" }, { type: "ResultCallback", name: "cb" }];
  const loaded = (o) => o && (field(o, "Title") !== void 0 || field(o, "Name") !== void 0);
  try {
    const total = field(c.graph.getObject(qoid), "Count") ?? 0;
    const expected = Math.max(0, Math.min(size, total - page * size));
    if (!expected) return { total, offset: page * size, rows: [] };
    const before = new Set(c.graph.objects.keys());
    await c.call(type, "RetainPage", pageParams, buildArgs([Arg.int(page)]), qoid);
    const end = Date.now() + 4e3;
    let found = [];
    while (Date.now() < end) {
      found = [...c.graph.objects.entries()].filter(([k, o]) => !before.has(k) && /VirtualQueryElement</.test(o.typeName)).map(([, o]) => obj(c, field(o, "Data")));
      if (found.length >= expected && found.every(loaded)) break;
      await wait(60);
    }
    return { total, offset: page * size, rows: found.filter(loaded).map(row) };
  } finally {
    try {
      c.remoting.callMethodNoReply(qoid, formatMethodSignature(type, "ReleasePage", pageParams), buildArgs([Arg.int(page)]));
    } catch {
    }
    try {
      c.remoting.callMethodNoReply(qoid, formatMethodSignature(type, "Dispose", []), Buffer.alloc(0));
    } catch {
    }
  }
}
async function albumInfo(c, members) {
  const criteria = c.structArg("Sooloos.Broker.Api.AlbumQueryCriteria", [english(), ...members]);
  const res = await c.call(
    "Library",
    "GetAlbumQueryInfo",
    [{ type: "Sooid", name: "profileid" }, { type: "AlbumQueryCriteria", name: "criteria" }, { type: "ResultCallback<AlbumQueryInfo>", name: "cb_result" }],
    Buffer.concat([buildArgs([Arg.sooid(c.profile())]), criteria]),
    c.serviceOid("Library")
  );
  if (!res.success) throw new RoonError(`Roon refused the Focus panel (${res.status})`);
  const v = c.graph.decodeReturnValue(Uint8Array.from(res.payload));
  if (!isRef(v)) throw new RoonError("Roon returned no Focus panel");
  const end = Date.now() + 3e3;
  while (Date.now() < end && field(c.graph.getObject(v.$ref), "FilteredTotalCount") === void 0) await wait(40);
  return c.graph.getObject(v.$ref);
}
var PANEL = { labels: ["GetLabels", "string"], artists: ["GetPerformers", "PerformerLite"], composers: ["GetComposers", "PerformerLite"], producers: ["GetProduction", "PerformerLite"], genres: ["GetGenres", "GenreLite"] };
async function panelList(c, info, what, search) {
  const [method, type] = PANEL[what];
  const res = await c.call("AlbumQueryInfo", method, [{ type: "string", name: "textfilter" }, { type: `ResultCallback<IList<HistogramItem<${type}>>>`, name: "cb_result" }], buildArgs([Arg.str(search)]), info.oid);
  if (!res.success) throw new RoonError(`Roon refused the ${what} list (${res.status})`);
  if (res.payload.length < 2) return [];
  const r = new BinaryReader(Uint8Array.from(res.payload));
  r.integer();
  const n = r.flexInt();
  const raw = [];
  const graph = c.graph;
  for (let i = 0; i < n && r.remaining > 0; i++) {
    const it = graph.readValue(r, 23);
    raw.push({ value: field(it, "Value"), n: field(it, "Count") ?? 0 });
  }
  await untilLoaded(c, raw.map((x) => x.value).filter(isRef), 1500);
  return raw.map((x) => ({ ref: isRef(x.value) ? x.value.$ref : null, name: isRef(x.value) ? field(obj(c, x.value), "Name") : x.value, n: x.n })).filter((x) => x.name).sort((a, b) => b.n - a.n);
}
async function focusMembers(c, f, people = ["artist", "composer", "producer"]) {
  const m = [];
  const matched = {};
  if (f.min_stars !== void 0) {
    const min = Math.ceil(f.min_stars * 2);
    if (!(min >= 1 && min <= 10)) throw new RoonError("min_stars is 0.5 to 5", "invalid");
    m.push({ name: "RequireRatings", propType: 23, value: intList(Array.from({ length: 11 - min }, (_, i) => min + i)) });
  }
  if (f.favorites) m.push(yes("RequireIsFavorite"));
  if (f.text) m.push(text("TextFilter", f.text));
  if (f.genre) m.push({ name: "RequireGenres", propType: 23, value: textList(names(f.genre)) });
  if (f.label) m.push({ name: "RequireLabels", propType: 23, value: textList(names(f.label)) });
  if (f.played_within_days) m.push({ name: "RequirePlayedInLastNDays", propType: 10, value: maybeInt(f.played_within_days) });
  if (f.not_played_within_days) m.push({ name: "ExcludePlayedInLastNDays", propType: 10, value: maybeInt(f.not_played_within_days) });
  if (f.added_within_days) m.push({ name: "RequireImportedInLastNDays", propType: 10, value: maybeInt(f.added_within_days) });
  if (f.hires) m.push({ name: "RequireSampleRates", propType: 23, value: intList([88200, 96e3, 176400, 192e3, 352800, 384e3]) });
  if (f.sample_rate) {
    const hz = names(f.sample_rate).map((x) => Math.round(parseFloat(x) * (parseFloat(x) < 1e3 ? 1e3 : 1))).filter((x) => x > 0);
    if (hz.length) m.push({ name: "RequireSampleRates", propType: 23, value: intList(hz) });
  }
  if (f.bits) {
    const b = names(f.bits).map(Number).filter((x) => x > 0);
    if (b.length) m.push({ name: "RequireBitsPerSample", propType: 23, value: intList(b) });
  }
  if (f.mqa === true) m.push(yes("RequireIsMQA"));
  else if (f.mqa === false) m.push(yes("ExcludeIsMQA"));
  if (f.storage) {
    const whole = await albumInfo(c, []);
    const want = f.storage.toLowerCase();
    const locs = items(c, field(whole, "Locations")).map((it) => field(it, "Value")).filter(isRef);
    await untilLoaded(c, locs, 1500);
    const hit = locs.find((v) => {
      const n = String(field(obj(c, v), "Name") ?? "").toLowerCase();
      return want === "local" ? !/tidal|qobuz/.test(n) : n.includes(want);
    });
    if (!hit) throw new RoonError(`No "${f.storage}" in this library's locations`, "not_found");
    m.push({ name: "RequireLocations", propType: 23, value: refList2([hit.$ref]) });
  }
  if (f.live === true) m.push(yes("RequireIsLive"));
  else if (f.live === false) m.push(yes("ExcludeIsLive"));
  if (f.compilation === true) m.push(yes("RequireIsCompilation"));
  else if (f.compilation === false) m.push(yes("ExcludeIsCompilation"));
  if (f.picks) m.push(yes("RequireIsPick"));
  if (f.bootleg === true) m.push(yes("RequireIsBootleg"));
  else if (f.bootleg === false) m.push(yes("ExcludeIsBootleg"));
  for (const [arg, member2] of [[f.album_type, "RequireTypes"], [f.exclude_album_type, "ExcludeTypes"]]) {
    if (!arg) continue;
    const want = names(arg).map((x) => albumTypeOf(x));
    const bad = want.findIndex((x) => x < 0);
    if (bad >= 0) throw new RoonError(`album type "${names(arg)[bad]}": choose from ${ALBUM_TYPES.join(", ")}`, "invalid");
    m.push({ name: member2, propType: 23, value: intList(want) });
  }
  if (f.year_from && f.year_from > 1e3) m.push({ name: "MinDate", propType: 23, value: dateValue(f.year_from, 0, 0) });
  if (f.year_to && f.year_to > 1e3) m.push({ name: "MaxDate", propType: 23, value: dateValue(f.year_to, 12, 31) });
  const wanted = [["artist", "artists", "RequirePerformers"], ["composer", "composers", "RequireComposers"], ["producer", "producers", "RequireProduction"]].filter(([p]) => people.includes(p) && f[p]);
  if (wanted.length) {
    const whole = await albumInfo(c, []);
    for (const [p, list, member2] of wanted) {
      const want = String(f[p]);
      const l = await panelList(c, whole, list, want);
      const hit = l.find((x) => String(x.name).toLowerCase() === want.toLowerCase()) ?? l[0];
      if (!hit || hit.ref === null) throw new RoonError(`No ${p} "${want}" in the library`, "not_found");
      m.push({ name: member2, propType: 23, value: refList2([hit.ref]) });
      matched[p] = hit.name;
    }
  }
  return { members: m, matched: Object.keys(matched).length ? matched : void 0 };
}
function ordering(c, kind, table, sort, ascending, descendingByDefault) {
  if (sort === void 0 && ascending === void 0) return [];
  const o = table[sort ?? Object.keys(table)[0]];
  if (o === void 0) throw new RoonError(`sort: choose from ${Object.keys(table).join(", ")}`, "invalid");
  const members = [{ name: "Ordering", propType: 9, value: new BinaryWriter().flexInt(o).toBuffer() }];
  const asc = ascending ?? (sort && descendingByDefault.includes(sort) ? false : void 0);
  if (asc !== void 0) members.push({ name: "Direction", propType: 9, value: new BinaryWriter().flexInt(asc ? 1 : 2).toBuffer() });
  if (sort === "random") members.push({ name: "RandomSeed", propType: 0, value: new BinaryWriter().integer(Math.floor(Math.random() * 2147483647)).toBuffer() });
  return [{ name: "Ordering", propType: 23, value: c.structArg(`Sooloos.Broker.Api.${kind}QueryOrdering`, members) }];
}
var ALBUM_ORDER = { artist: 0, added: 1, released: 2, most_played: 3, title: 4, popular: 5, random: 7 };
async function library2(f, sort, ascending, limit, offset) {
  return withCore(async (c) => {
    const { members, matched } = await focusMembers(c, f);
    members.push(...ordering(c, "Album", ALBUM_ORDER, sort, ascending, ["added", "released", "most_played", "popular"]));
    const out = await virtualQuery(c, "Album", members, limit, offset, (o) => albumRow(c, o));
    return { ...out, matched };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  album,
  closeSoon,
  library,
  shutdown,
  zetGekoppeld
});
