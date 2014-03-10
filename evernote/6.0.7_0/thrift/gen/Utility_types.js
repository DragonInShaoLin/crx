MarketingEmailType={DESKTOP_UPSELL:1};
SupportTicket=function(a){this.issueDescription=this.subject=this.logFile=this.connectionInfo=this.carrierInfo=this.deviceInfo=this.osInfo=this.contactEmail=this.applicationVersion=null;a&&(void 0!==a.applicationVersion&&(this.applicationVersion=a.applicationVersion),void 0!==a.contactEmail&&(this.contactEmail=a.contactEmail),void 0!==a.osInfo&&(this.osInfo=a.osInfo),void 0!==a.deviceInfo&&(this.deviceInfo=a.deviceInfo),void 0!==a.carrierInfo&&(this.carrierInfo=a.carrierInfo),void 0!==a.connectionInfo&&
(this.connectionInfo=a.connectionInfo),void 0!==a.logFile&&(this.logFile=a.logFile),void 0!==a.subject&&(this.subject=a.subject),void 0!==a.issueDescription&&(this.issueDescription=a.issueDescription))};SupportTicket.prototype={};
SupportTicket.prototype.read=function(a){for(a.readStructBegin();;){var c=a.readFieldBegin(),b=c.ftype;if(b==Thrift.Type.STOP)break;switch(c.fid){case 1:b==Thrift.Type.STRING?this.applicationVersion=a.readString().value:a.skip(b);break;case 2:b==Thrift.Type.STRING?this.contactEmail=a.readString().value:a.skip(b);break;case 3:b==Thrift.Type.STRING?this.osInfo=a.readString().value:a.skip(b);break;case 4:b==Thrift.Type.STRING?this.deviceInfo=a.readString().value:a.skip(b);break;case 5:b==Thrift.Type.STRING?
this.carrierInfo=a.readString().value:a.skip(b);break;case 6:b==Thrift.Type.STRING?this.connectionInfo=a.readString().value:a.skip(b);break;case 7:b==Thrift.Type.STRUCT?(this.logFile=new Data,this.logFile.read(a)):a.skip(b);break;case 8:b==Thrift.Type.STRING?this.subject=a.readString().value:a.skip(b);break;case 9:b==Thrift.Type.STRING?this.issueDescription=a.readString().value:a.skip(b);break;default:a.skip(b)}a.readFieldEnd()}a.readStructEnd()};
SupportTicket.prototype.write=function(a){a.writeStructBegin("SupportTicket");null!==this.applicationVersion&&void 0!==this.applicationVersion&&(a.writeFieldBegin("applicationVersion",Thrift.Type.STRING,1),a.writeString(this.applicationVersion),a.writeFieldEnd());null!==this.contactEmail&&void 0!==this.contactEmail&&(a.writeFieldBegin("contactEmail",Thrift.Type.STRING,2),a.writeString(this.contactEmail),a.writeFieldEnd());null!==this.osInfo&&void 0!==this.osInfo&&(a.writeFieldBegin("osInfo",Thrift.Type.STRING,
3),a.writeString(this.osInfo),a.writeFieldEnd());null!==this.deviceInfo&&void 0!==this.deviceInfo&&(a.writeFieldBegin("deviceInfo",Thrift.Type.STRING,4),a.writeString(this.deviceInfo),a.writeFieldEnd());null!==this.carrierInfo&&void 0!==this.carrierInfo&&(a.writeFieldBegin("carrierInfo",Thrift.Type.STRING,5),a.writeString(this.carrierInfo),a.writeFieldEnd());null!==this.connectionInfo&&void 0!==this.connectionInfo&&(a.writeFieldBegin("connectionInfo",Thrift.Type.STRING,6),a.writeString(this.connectionInfo),
a.writeFieldEnd());null!==this.logFile&&void 0!==this.logFile&&(a.writeFieldBegin("logFile",Thrift.Type.STRUCT,7),this.logFile.write(a),a.writeFieldEnd());null!==this.subject&&void 0!==this.subject&&(a.writeFieldBegin("subject",Thrift.Type.STRING,8),a.writeString(this.subject),a.writeFieldEnd());null!==this.issueDescription&&void 0!==this.issueDescription&&(a.writeFieldBegin("issueDescription",Thrift.Type.STRING,9),a.writeString(this.issueDescription),a.writeFieldEnd());a.writeFieldStop();a.writeStructEnd()};
AppFeedback=function(a){this.feedback=this.rating=null;a&&(void 0!==a.rating&&(this.rating=a.rating),void 0!==a.feedback&&(this.feedback=a.feedback))};AppFeedback.prototype={};AppFeedback.prototype.read=function(a){for(a.readStructBegin();;){var c=a.readFieldBegin(),b=c.ftype;if(b==Thrift.Type.STOP)break;switch(c.fid){case 1:b==Thrift.Type.BYTE?this.rating=a.readByte().value:a.skip(b);break;case 2:b==Thrift.Type.STRUCT?(this.feedback=new SupportTicket,this.feedback.read(a)):a.skip(b);break;default:a.skip(b)}a.readFieldEnd()}a.readStructEnd()};
AppFeedback.prototype.write=function(a){a.writeStructBegin("AppFeedback");null!==this.rating&&void 0!==this.rating&&(a.writeFieldBegin("rating",Thrift.Type.BYTE,1),a.writeByte(this.rating),a.writeFieldEnd());null!==this.feedback&&void 0!==this.feedback&&(a.writeFieldBegin("feedback",Thrift.Type.STRUCT,2),this.feedback.write(a),a.writeFieldEnd());a.writeFieldStop();a.writeStructEnd()};
MarketingEmailParameters=function(a){this.marketingEmailType=null;a&&void 0!==a.marketingEmailType&&(this.marketingEmailType=a.marketingEmailType)};MarketingEmailParameters.prototype={};MarketingEmailParameters.prototype.read=function(a){for(a.readStructBegin();;){var c=a.readFieldBegin(),b=c.ftype;if(b==Thrift.Type.STOP)break;switch(c.fid){case 1:b==Thrift.Type.I32?this.marketingEmailType=a.readI32().value:a.skip(b);break;case 0:a.skip(b);break;default:a.skip(b)}a.readFieldEnd()}a.readStructEnd()};
MarketingEmailParameters.prototype.write=function(a){a.writeStructBegin("MarketingEmailParameters");null!==this.marketingEmailType&&void 0!==this.marketingEmailType&&(a.writeFieldBegin("marketingEmailType",Thrift.Type.I32,1),a.writeI32(this.marketingEmailType),a.writeFieldEnd());a.writeFieldStop();a.writeStructEnd()};
CrossPromotionInfo=function(a){this.usesSkitchAndroid=this.usesSkitchIOS=this.usesSkitchMac=this.usesSkitchWindows=this.usesPenultimateIOS=this.usesFoodAndroid=this.usesFoodIOS=this.usesClearly=this.usesWebClipper=this.usesEvernoteAndroid=this.usesEvernoteIOS=this.usesEvernoteMac=this.usesEvernoteWindows=null;a&&(void 0!==a.usesEvernoteWindows&&(this.usesEvernoteWindows=a.usesEvernoteWindows),void 0!==a.usesEvernoteMac&&(this.usesEvernoteMac=a.usesEvernoteMac),void 0!==a.usesEvernoteIOS&&(this.usesEvernoteIOS=
a.usesEvernoteIOS),void 0!==a.usesEvernoteAndroid&&(this.usesEvernoteAndroid=a.usesEvernoteAndroid),void 0!==a.usesWebClipper&&(this.usesWebClipper=a.usesWebClipper),void 0!==a.usesClearly&&(this.usesClearly=a.usesClearly),void 0!==a.usesFoodIOS&&(this.usesFoodIOS=a.usesFoodIOS),void 0!==a.usesFoodAndroid&&(this.usesFoodAndroid=a.usesFoodAndroid),void 0!==a.usesPenultimateIOS&&(this.usesPenultimateIOS=a.usesPenultimateIOS),void 0!==a.usesSkitchWindows&&(this.usesSkitchWindows=a.usesSkitchWindows),
void 0!==a.usesSkitchMac&&(this.usesSkitchMac=a.usesSkitchMac),void 0!==a.usesSkitchIOS&&(this.usesSkitchIOS=a.usesSkitchIOS),void 0!==a.usesSkitchAndroid&&(this.usesSkitchAndroid=a.usesSkitchAndroid))};CrossPromotionInfo.prototype={};
CrossPromotionInfo.prototype.read=function(a){for(a.readStructBegin();;){var c=a.readFieldBegin(),b=c.ftype;if(b==Thrift.Type.STOP)break;switch(c.fid){case 1:b==Thrift.Type.BOOL?this.usesEvernoteWindows=a.readBool().value:a.skip(b);break;case 2:b==Thrift.Type.BOOL?this.usesEvernoteMac=a.readBool().value:a.skip(b);break;case 3:b==Thrift.Type.BOOL?this.usesEvernoteIOS=a.readBool().value:a.skip(b);break;case 4:b==Thrift.Type.BOOL?this.usesEvernoteAndroid=a.readBool().value:a.skip(b);break;case 5:b==
Thrift.Type.BOOL?this.usesWebClipper=a.readBool().value:a.skip(b);break;case 6:b==Thrift.Type.BOOL?this.usesClearly=a.readBool().value:a.skip(b);break;case 7:b==Thrift.Type.BOOL?this.usesFoodIOS=a.readBool().value:a.skip(b);break;case 8:b==Thrift.Type.BOOL?this.usesFoodAndroid=a.readBool().value:a.skip(b);break;case 9:b==Thrift.Type.BOOL?this.usesPenultimateIOS=a.readBool().value:a.skip(b);break;case 10:b==Thrift.Type.BOOL?this.usesSkitchWindows=a.readBool().value:a.skip(b);break;case 11:b==Thrift.Type.BOOL?
this.usesSkitchMac=a.readBool().value:a.skip(b);break;case 12:b==Thrift.Type.BOOL?this.usesSkitchIOS=a.readBool().value:a.skip(b);break;case 13:b==Thrift.Type.BOOL?this.usesSkitchAndroid=a.readBool().value:a.skip(b);break;default:a.skip(b)}a.readFieldEnd()}a.readStructEnd()};
CrossPromotionInfo.prototype.write=function(a){a.writeStructBegin("CrossPromotionInfo");null!==this.usesEvernoteWindows&&void 0!==this.usesEvernoteWindows&&(a.writeFieldBegin("usesEvernoteWindows",Thrift.Type.BOOL,1),a.writeBool(this.usesEvernoteWindows),a.writeFieldEnd());null!==this.usesEvernoteMac&&void 0!==this.usesEvernoteMac&&(a.writeFieldBegin("usesEvernoteMac",Thrift.Type.BOOL,2),a.writeBool(this.usesEvernoteMac),a.writeFieldEnd());null!==this.usesEvernoteIOS&&void 0!==this.usesEvernoteIOS&&
(a.writeFieldBegin("usesEvernoteIOS",Thrift.Type.BOOL,3),a.writeBool(this.usesEvernoteIOS),a.writeFieldEnd());null!==this.usesEvernoteAndroid&&void 0!==this.usesEvernoteAndroid&&(a.writeFieldBegin("usesEvernoteAndroid",Thrift.Type.BOOL,4),a.writeBool(this.usesEvernoteAndroid),a.writeFieldEnd());null!==this.usesWebClipper&&void 0!==this.usesWebClipper&&(a.writeFieldBegin("usesWebClipper",Thrift.Type.BOOL,5),a.writeBool(this.usesWebClipper),a.writeFieldEnd());null!==this.usesClearly&&void 0!==this.usesClearly&&
(a.writeFieldBegin("usesClearly",Thrift.Type.BOOL,6),a.writeBool(this.usesClearly),a.writeFieldEnd());null!==this.usesFoodIOS&&void 0!==this.usesFoodIOS&&(a.writeFieldBegin("usesFoodIOS",Thrift.Type.BOOL,7),a.writeBool(this.usesFoodIOS),a.writeFieldEnd());null!==this.usesFoodAndroid&&void 0!==this.usesFoodAndroid&&(a.writeFieldBegin("usesFoodAndroid",Thrift.Type.BOOL,8),a.writeBool(this.usesFoodAndroid),a.writeFieldEnd());null!==this.usesPenultimateIOS&&void 0!==this.usesPenultimateIOS&&(a.writeFieldBegin("usesPenultimateIOS",
Thrift.Type.BOOL,9),a.writeBool(this.usesPenultimateIOS),a.writeFieldEnd());null!==this.usesSkitchWindows&&void 0!==this.usesSkitchWindows&&(a.writeFieldBegin("usesSkitchWindows",Thrift.Type.BOOL,10),a.writeBool(this.usesSkitchWindows),a.writeFieldEnd());null!==this.usesSkitchMac&&void 0!==this.usesSkitchMac&&(a.writeFieldBegin("usesSkitchMac",Thrift.Type.BOOL,11),a.writeBool(this.usesSkitchMac),a.writeFieldEnd());null!==this.usesSkitchIOS&&void 0!==this.usesSkitchIOS&&(a.writeFieldBegin("usesSkitchIOS",
Thrift.Type.BOOL,12),a.writeBool(this.usesSkitchIOS),a.writeFieldEnd());null!==this.usesSkitchAndroid&&void 0!==this.usesSkitchAndroid&&(a.writeFieldBegin("usesSkitchAndroid",Thrift.Type.BOOL,13),a.writeBool(this.usesSkitchAndroid),a.writeFieldEnd());a.writeFieldStop();a.writeStructEnd()};BusinessInvitation=function(a){this.email=this.businessId=null;a&&(void 0!==a.businessId&&(this.businessId=a.businessId),void 0!==a.email&&(this.email=a.email))};BusinessInvitation.prototype={};
BusinessInvitation.prototype.read=function(a){for(a.readStructBegin();;){var c=a.readFieldBegin(),b=c.ftype;if(b==Thrift.Type.STOP)break;switch(c.fid){case 1:b==Thrift.Type.I32?this.businessId=a.readI32().value:a.skip(b);break;case 2:b==Thrift.Type.STRING?this.email=a.readString().value:a.skip(b);break;default:a.skip(b)}a.readFieldEnd()}a.readStructEnd()};
BusinessInvitation.prototype.write=function(a){a.writeStructBegin("BusinessInvitation");null!==this.businessId&&void 0!==this.businessId&&(a.writeFieldBegin("businessId",Thrift.Type.I32,1),a.writeI32(this.businessId),a.writeFieldEnd());null!==this.email&&void 0!==this.email&&(a.writeFieldBegin("email",Thrift.Type.STRING,2),a.writeString(this.email),a.writeFieldEnd());a.writeFieldStop();a.writeStructEnd()};