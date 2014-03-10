# -*- coding: utf-8 -*-
import urllib, urllib2, json, time, sys
from poster.encode import multipart_encode
from poster.streaminghttp import register_openers

## 命令行参数 (shell命令)
# python scan_upload_urlfile.py /root/jenkins/url.txt
file = sys.argv[1]


# 把url列表文件上传到扫雷平台  （window测试发现不能上传，poster模块有问题？完败！）
print 'upload file...'
register_openers()
datagen, headers = multipart_encode({"urlfile": open(file, "r")})
req = urllib2.Request("http://scan.baidu.com/task/detail/upload", datagen, headers)
res = urllib2.urlopen(req)
result = res.read().decode('utf8')
res.close()
result = json.loads(result)
if result["status"] == "ok":
	print 'upload file ok'
	print result["file"]
else:
	print 'upload failure'
	raise Exception(result)


## 线上环境. 修改TOKEN.
UIurl = 'http://scan.baidu.com'
APIurl = 'http://api.scan.baidu.com'
token = ''

## 配置任务信息. 请根据产品线情况进行定制.
task = {
			"TaskName": "QA_SafeCheck_from_API", # 可选
			"InitUrl": "", # 必需,与下面二选一
			"UrlsFile": result["file"], # 与上面二选一, 如使用此参数, 则只能选择Vulnerability和LVscanner, Pocscan、Weakness和Spider需置为false
			"UserAgent": "", # 可选, 默认火狐
			"Referer": "", # 可选, 默认为空
			"Callback": "", # 可选, 如需回调则应设置
			"Cookie": "", # 可选, cookie
			"HostBind": "", # 可选, 主机绑定, 注意顺序
			"NoticeMail": "zhongwuqiang@baidu.com", # 可选, 任务结束时发送通知到的邮箱.(建议必填项)
			"LoginType": "", # 可选, 用于登录 
			"LoginUsername": "", # 可选, 用于登录
			"LoginPassword": "", # 可选, 用于登录
			"LoginUrl": "", # 可选, 用于uc登录, 一般与InitUrl相同即可
			"Step": {
				"Vulnerability": "true",
				"LVScanner": "true",
			},
			"Vulnerability": {
				"Plugins": "xss,flash_xss" # 漏洞扫描的插件.(建议默认值)
			},
			"LVScanner": {
				"Plugins": "xss,sql,php_cmd,struts_cmd,file_include,intra_proxy,url_location,fastcgi_parse,csrf" # 漏洞扫描的插件,可选N个.(建议默认值)
			}
		}
		
# 创建任务. 如果任务创建失败,那么会抛出异常终止程序.
print 'Create task...'
values = {"token": token, "task":json.dumps(task)}
data = urllib.urlencode(values)
req = urllib2.Request(url = APIurl + '/api/v2/tasks', data = data)
res = urllib2.urlopen(req)
result = res.read().decode('utf8')
res.close()
result = json.loads(result)
print 'Scan Urls:' + task["UrlsFile"] 
if result["status"] == "ok":
	taskid = result["taskid"]
	print 'Create success, taskid=' + str(taskid)
	print 'Details page:' + UIurl + '/report/task/' + str(taskid)
else:
	print 'Create failure'
	print result["msg"]
	raise Exception('Create task Failure')

	
# 查询任务. 每2分钟查询1次,直到扫描为结束状态. 如果查询结果不为安全,那么会抛出异常终止程序.
print 'Query result...'
values = {"token": token, "id":taskid}
data = urllib.urlencode(values)
while True:
	print time.strftime('%Y-%m-%d %H:%M:%S') 
	req = urllib2.Request(url = APIurl + '/api/v2/tasks?' + data)
	res = urllib2.urlopen(req)
	result = res.read().decode('utf8')
	res.close()
	result = json.loads(result)
	status = result["tasks"][0]["Status"]
	risk = result["tasks"][0]["Risk"]
	if status == '0':
		print 'Starting...'
	elif status == '1':
		print 'Scanning...'
	elif status == '2':
		print 'Scan End.'
		if risk == '0':
			print '[No Bug]'
		elif risk == '1':
			print 'Low risk!!!'
		elif risk == '2':
			print 'Medium risk!!!'
		elif risk == '3':
			print 'High risk!!!'
		print 'The result send to email:'
		print task["NoticeMail"]
		break
	time.sleep(120)


# 生成临时分享链接
req = urllib2.Request(url = APIurl + '/api/v2/tasks/' + str(taskid) + '/share' ,data='token=' + token)
res = urllib2.urlopen(req)
result = res.read().decode('utf8')
res.close()
result = json.loads(result)
if result["status"] == 'ok':
	print 'The Share Link:'
	print UIurl + '/report/task/' + str(taskid) + '/?uuid=' + result["uuid"]
else:
	raise Exception('Get Share Link ERROR')


# 确定扫描结果是否抛出异常
if risk != '0':
	raise Exception('the Safe Bug need to fix')
