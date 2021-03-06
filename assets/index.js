require('dotenv').config();

const { promisify } = require('util');
const { readFile } = require('fs');
const { send } = require('micro');
const { router, get } = require('microrouter');
const { Z_BEST_COMPRESSION } = require('zlib');
const microCors = require('micro-cors');
const compress = require('micro-compress');
const sentry = require('micro-sentry');
const signBunny = require('sign-bunny');
const validate = require('uuid-validate');

// Setup
const readFileAsync = promisify(readFile);
const cors = microCors({ allowMethods: ['GET'] });
const isValidUUID = uuid => validate(uuid, 4);
const notFoundResp = res => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    send(res, 404, signBunny("Dead End ☠️"));
};

// Guaranteed Assets
const flowsResp = require('./flows.json');
const fieldsResp = require('./fields.json');
const groupsResp = require('./groups.json');

// Handlers
const flows = (req, res) => {
    if (Object.keys(req.query).length > 0) {
        if (req.query.uuid) {
            if (isValidUUID(req.query.uuid)) {
                return readFileAsync(
                    `${__dirname}/flows/${req.query.uuid}.json`,
                    {
                        encoding: 'utf8'
                    }
                )
                    .then(contents => {
                        const obj = JSON.parse(contents);
                        send(res, 200, obj);
                    })
                    .catch(err => notFoundResp(res));
            }
        }
    }
    return send(res, 200, flowsResp);
};
const fields = (req, res) => send(res, 200, fieldsResp);
const groups = (req, res) => send(res, 200, groupsResp);
const notFound = (req, res) => notFoundResp(res);

// HOFs
const withRouter = router(
    get('/assets/flows.json', cors(flows)),
    get('/assets/fields.json', cors(fields)),
    get('/assets/groups.json', cors(groups)),
    get('/*', notFound)
);
const withSentry = sentry(process.env.SENTRY_URL)(withRouter);
const withCompression = compress({ level: Z_BEST_COMPRESSION }, withRouter);

module.exports = withCompression;
