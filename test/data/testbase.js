const path = require('path');
const {getParseResult, getTestCaseMap} = require('../../');
const fse = require('fs-extra');

let testFiles = [];
// const PROJECT_ROOT = process.cwd();
const PROJECT_ROOT = path.join(__dirname, '.test_output');

// https://mochajs.org/#available-root-hooks
exports.mochaHooks = {
  async beforeAll() {
    // 初始清理
    testFiles = [];
  },

  async afterAll() {
    // 最后的处理
    console.log(PROJECT_ROOT);
    console.log(testFiles);

    const testCaseMap = getTestCaseMap(getParseResult(testFiles, {isInherit: true}), '#');
    console.log(testCaseMap);
    fse.outputJsonSync(path.join(PROJECT_ROOT, 'test-case-map.json'), testCaseMap);

    const dwtCases = {};
    Object.keys(testCaseMap).forEach(fullTitle => {
      const treeNode = testCaseMap[fullTitle];

      if (!treeNode.nodeInfo || treeNode.nodeInfo.callee !== 'it') {
        return;
      }

      const caseItem = {
        describe: treeNode.nodeInfo.describe,
        case: treeNode.nodeInfo.describe,
        moduleName: treeNode.fullFile,
      };

      dwtCases[fullTitle] = {...caseItem, ...treeNode.comment};
    });
    console.log(dwtCases);
    fse.outputJsonSync(path.join(PROJECT_ROOT, 'dwt-cases.json'), dwtCases);
  },

  async afterEach() {
    // 记录执行的文件
    const {file} = this.currentTest;

    if (testFiles.indexOf(file) < 0) {
      testFiles.push(file);
    }
  },
};
