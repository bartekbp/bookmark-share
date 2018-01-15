from flask import Flask, json, request

app = Flask(__name__)

data = {}
mock = {
	'id': 'uuid',
	'items': [{
		'title': 'dir',
		'children': [{
			'url': 'www.google.com',
			'title': 'google'
		}]
	}]
}

@app.route("/items/<string:uuid>", methods=['GET', 'PUT', 'OPTIONS'])
def items(uuid):
	if request.method == 'OPTIONS':
		return 
	if request.method == 'PUT':
		data[uuid] = request.get_json()
		return json.jsonify({})
	else:
		return json.jsonify(data[uuid] if uuid in data else mock)


app.run(host='0.0.0.0', port=9000)