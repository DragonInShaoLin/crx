Thrift.BinaryProtocol=function(a,b,c){this.transport=this.trans=a;this.strictRead=void 0!==b?b:!1;this.strictWrite=void 0!==c?c:!0};
Thrift.BinaryParser={fromByte:function(a){return(new Int8Array([a])).buffer},fromShort:function(a){a=parseInt(a);var b=new ArrayBuffer(2);(new DataView(b)).setInt16(0,a);return b},fromInt:function(a){a=parseInt(a);var b=new ArrayBuffer(4);(new DataView(b)).setInt32(0,a);return b},fromLong:function(a){a=parseInt(a);if(Math.abs(a)>=Math.pow(2,53))throw Error("Unable to accurately transfer numbers larger than 2^53 - 1 as integers. Number provided was "+a);var b=(Array(64).join("0")+Math.abs(a).toString(2)).slice(-64);
0>a&&(b=this.twosCompliment(b));a=new ArrayBuffer(8);for(var c=new DataView(a),d=0;8>d;d++){var e=parseInt(b.substr(8*d,8),2);c.setUint8(d,e)}return a},twosCompliment:function(a){var b=a.lastIndexOf("1");return a=a.substring(0,b).replace(/1/g,"x").replace(/0/g,"1").replace(/x/g,"0")+a.substring(b)},fromDouble:function(a){var b=new ArrayBuffer(8);(new DataView(b)).setFloat64(0,a);return b},fromString:function(a){var b=unescape(encodeURIComponent(a)),c=b.length,d=new Uint8Array(c);for(a=0;a<c;a++)d[a]=
b.charCodeAt(a);return d.buffer},toByte:function(a){return a.getUint8(0)},toBytes:function(a){return new Uint8Array(a.buffer,a.byteOffset,a.byteLength)},toShort:function(a){return a.getInt16(0)},toInt:function(a){return a.getInt32(0)},toLong:function(a){for(var b=1,c="",d=0;8>d;d++)c+=(Array(8).join("0")+a.getUint8(d).toString(2)).slice(-8);"1"===c[0]&&(b=-1,c=this.twosCompliment(c));a=c.indexOf("1");if(-1!=a&&10>a)throw Error("Unable to receive number larger than 2^53 - 1 as an integer");return parseInt(c,
2)*b},toDouble:function(a){return a.getFloat64(0)},toString:function(a){var b="",c,d=a.byteLength,e;for(c=0;c<d;c++)e=a.getUint8(c).toString(16),1==e.length&&(e="0"+e),b+="%"+e;return b=decodeURIComponent(b)}};
(function(a){var b=Thrift.BinaryParser;a.flush=function(){return this.trans.flush()};var c=Thrift.Type;a.writeMessageBegin=function(d,a,b){this.strictWrite?(this.writeI32(-2147418112|a),this.writeString(d)):(this.writeString(d),this.writeByte(a));this.writeI32(b)};a.writeMessageEnd=function(){};a.writeStructBegin=function(a){};a.writeStructEnd=function(){};a.writeFieldBegin=function(a,b,c){this.writeByte(b);this.writeI16(c)};a.writeFieldEnd=function(){};a.writeFieldStop=function(){this.writeByte(c.STOP)};
a.writeMapBegin=function(a,b,c){this.writeByte(a);this.writeByte(b);this.writeI32(c)};a.writeMapEnd=function(){};a.writeListBegin=function(a,b){this.writeByte(a);this.writeI32(b)};a.writeListEnd=function(){};a.writeSetBegin=function(a,b){console.log("write set",a,b);this.writeByte(a);this.writeI32(b)};a.writeSetEnd=function(){};a.writeBool=function(a){a?this.writeByte(1):this.writeByte(0)};a.writeByte=function(a){this.trans.write(b.fromByte(a))};a.writeBinary=function(a){"string"===typeof a&&(a=b.fromString(a));
if(a.byteLength)this.writeI32(a.byteLength);else throw Error("Cannot read length of binary data");this.trans.write(a)};a.writeI16=function(a){this.trans.write(b.fromShort(a))};a.writeI32=function(a){this.trans.write(b.fromInt(a))};a.writeI64=function(a){this.trans.write(b.fromLong(a))};a.writeDouble=function(a){this.trans.write(b.fromDouble(a))};a.writeString=function(a){a=b.fromString(a);this.writeI32(a.byteLength);this.trans.write(a)};a.readMessageBegin=function(){var a=this.readI32().value,b,c;
if(0>a){b=a&-65536;if(-2147418112!=b)throw console.log("BAD: "+b),Error("Bad version in readMessageBegin: "+a);a&=255;b=this.readString().value}else{if(this.strictRead)throw Error("No protocol version header");b=this.trans.read(a);a=this.readByte().value}c=this.readI32().value;return{fname:b,mtype:a,rseqid:c}};a.readMessageEnd=function(){};a.readStructBegin=function(){return{fname:""}};a.readStructEnd=function(){};a.readFieldBegin=function(){var a=this.readByte().value;if(a==c.STOP)return{fname:null,
ftype:a,fid:0};var b=this.readI16().value;return{fname:null,ftype:a,fid:b}};a.readFieldEnd=function(){};a.readMapBegin=function(){this.rstack=[];this.rpos=[1];var a=this.readByte().value,b=this.readByte().value,c=this.readI32().value;return{ktype:a,vtype:b,size:c}};a.readMapEnd=function(){};a.readListBegin=function(){var a=this.readByte().value,b=this.readI32().value;return{etype:a,size:b}};a.readListEnd=function(){};a.readSetBegin=function(){var a=this.readByte().value,b=this.readI32().value;return{etype:a,
size:b}};a.readSetEnd=function(){};a.readBool=function(){return 0==this.readByte().value?{value:!1}:{value:!0}};a.readByte=function(){var a=this.trans.read(1);return{value:b.toByte(a)}};a.readI16=function(){var a=this.trans.read(2);return{value:b.toShort(a)}};a.readI32=function(){var a=this.trans.read(4);return{value:b.toInt(a)}};a.readI64=function(){var a=this.trans.read(8);return{value:b.toLong(a)}};a.readDouble=function(){var a=this.trans.read(8);return{value:b.toDouble(a)}};a.readBinary=function(){var a=
this.readI32().value,a=this.trans.read(a);return{value:b.toBytes(a)}};a.readString=function(){var a=this.readI32().value,a=this.trans.read(a);return{value:b.toString(a)}};a.getTransport=function(){return this.trans};a.skip=function(a){switch(a){case c.STOP:break;case c.BOOL:this.readBool();break;case c.BYTE:this.readByte();break;case c.I16:this.readI16();break;case c.I32:this.readI32();break;case c.I64:this.readI64();break;case c.DOUBLE:this.readDouble();break;case c.STRING:this.readString();break;
case c.STRUCT:for(this.readStructBegin();;){a=this.readFieldBegin();if(a.ftype===c.STOP)break;this.skip(a.ftype);this.readFieldEnd()}this.readStructEnd();break;case c.MAP:a=this.readMapBegin();for(var b=0;b<a.size;++b)this.skip(a.ktype),this.skip(a.vtype);this.readMapEnd();break;case c.SET:a=this.readSetBegin();for(b=0;b<a.size;++b)this.skip(a.etype);this.readSetEnd();break;case c.LIST:a=this.readListBegin();for(b=0;b<a.size;++b)this.skip(a.etype);this.readListEnd();break;default:throw Error("Invalid type: "+
a);}}})(Thrift.BinaryProtocol.prototype);Thrift.BinaryHttpTransport=function(a){this.url=a;this.buffer=[];this.received=null;this.offset=0};
(function(a){a.open=function(){};a.close=function(){};a.read=function(a){var c=new DataView(this.received,this.offset,a);this.offset+=a;return c};a.write=function(a){this.buffer.push(a)};a.flush=function(a){if(!a)throw"Error in BinaryHttpTransport.flush: Binary protocol does not support synchronous calls";a=this.buffer.reduce(function(a,b){return a+b.byteLength},0);var c=new Uint8Array(new ArrayBuffer(a)),d=0;this.buffer.forEach(function(a){var b=null,b=a.buffer?a instanceof Uint8Array?a:new Uint8Array(a.buffer,
a.byteOffset,a.byteLength):new Uint8Array(a);c.set(b,d);d+=a.byteLength});this.buffer=[];return c};a.send=function(a,c,d,e){d=Array.prototype.slice.call(d,0);var g=d.pop(),h=0<d.length?d.pop():g;"function"!==typeof h&&(h=g);var f=new XMLHttpRequest;f.open("POST",this.url,!0);f.setRequestHeader("Content-Type","application/x-thrift");f.setRequestHeader("Accept","application/x-thrift");f.responseType="arraybuffer";f.onload=function(c){this.received=f.response;this.offset=0;try{var d=e.call(a)}catch(k){d=
k,h=g}h(d)}.bind(this);f.onerror=function(a){g(a)};f.send(c.buffer)}})(Thrift.BinaryHttpTransport.prototype);