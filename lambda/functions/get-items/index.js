const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-central-1" });

const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

exports.handle = function(e, ctx, cb) {
  const params = {
    TableName: "share-bookmark-items",
    Key: {
      id: e.pathParameters.id
    }
  };

  docClient.get(params, (err, data) => {
    if (err) {
      cb(err, null);
      return;
    }

    if (data.Item) {
      cb(null, {
        isBase64Encoded: false,
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data.Item)
      });
      return;
    }

    cb(null, {
      isBase64Encoded: false,
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: e.pathParameters.id,
        items: []
      })
    });
    return;
  });
};
