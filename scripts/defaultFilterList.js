var defaultFilterList = [
  {
    name: "Default - China",
    isEnabled: true,
    isEditable: false,
    rules: [
      {
        src: "http://ajax.googleapis.com/ajax/*",
        dest: "http://ajax.useso.com/ajax/*",
        matchProtocol: false,
      },
      {
        src: "http://html5shiv.googlecode.com/svn/trunk/html5.js",
        dest: "",
        matchProtocol: true,
      },
      {
        src: "http://fonts.googleapis.com/*",
        dest: "http://fonts.useso.com/*",
        matchProtocol: false,
      },
      {
        src: "https://*fastly.net*",
        dest: "http://*fastly.net*",
        matchProtocol: true,
      },
      {
        src: "http://*google.com*",
        dest: "",
        matchProtocol: false,
      },
      {
        src: "http://*googleapis.*",
        dest: "",
        matchProtocol: false,
      },
      {
        src: "http://*googlecode.*",
        dest: "",
        matchProtocol: false,
      },
      {
        src: "http://*facebook.*",
        dest: "",
        matchProtocol: false,
      },
      {
        src: "http://*twitter.*",
        dest: "",
        matchProtocol: false,
      },
      {
        src: "http://*youtube.*",
        dest: "",
        matchProtocol: false,
      },
      {
        src: "http://*youtu.be*",
        dest: "",
        matchProtocol: false,
      },
    ]
  }
];
