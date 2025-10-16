var posts=["2025/10/16/Linux命令/","2025/10/16/Typora使用指南（Markdown语法）/","2025/10/16/git的使用/","2025/10/16/Win11 安装 WSL 和 Ubuntu时踩的坑/","2025/10/16/代理和谷歌账号注册/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };