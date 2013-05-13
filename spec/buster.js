var config = module.exports;

config["Browser tests"] = {
   env: "browser",
   rootPath: "../",
   sources: [
      "js/jQuery.js",
      "js/controller.js",
      "js/mongobook.js"
   ],
   tests: [
      "spec/*Test.js"
   ]
};

config["Node tests"] = {
   env: "node",
   rootPath: "../",
   tests: [
      "spec/*Test.js"
   ]
};

