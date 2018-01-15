const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-central-1" });

const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

exports.handle = function(e, ctx, cb) {
  const params = {
    TableName: "share-bookmark-items",
    Item: JSON.parse(e.body)
  };

  docClient.put(params, (err, data) => {
    cb(err, {
      isBase64Encoded: false,
      statusCode: 204,
      headers: {
        "Content-Type": "application/json"
      },
      body: ""
    });
  });
};
