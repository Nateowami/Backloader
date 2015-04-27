var defaultFilterList = [
  {
    name: "Default - China",
    isEnabled: true,
    isEditable: false,
    activePage: null,
    rules: [
      {
        src: "ajax.googleapis.com/ajax/*",
        dest: "http://ajax.useso.com/ajax/*",
      },
      {
        src: "fonts.googleapis.com/*",
        dest: "http://fonts.useso.com/*",
      },
      {
        src: "https://*fastly.net*",
        dest: "http://*fastly.net*",
      },
      {
        src: "*google.com*",
        dest: "",
      },
      {
        src: "*googleapis.*",
        dest: "",
      },
      {
        src: "*googlecode.*",
        dest: "",
      },
      {
        src: "*facebook.*",
        dest: "",
      },
      {
        src: "*twitter.*",
        dest: "",
      },
      {
        src: "*youtube.*",
        dest: "",
      },
      {
        src: "*youtu.be*",
        dest: "",
      },
    ]
  }
];
