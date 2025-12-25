class Response {
  /**
   * 成功响应
   */
  static success(data = null, message = '操作成功') {
    return {
      code: 200,
      message,
      data,
      timestamp: Date.now()
    };
  }

  /**
   * 错误响应
   */
  static error(code = 500, message = '服务器内部错误') {
    return {
      code,
      message,
      data: null,
      timestamp: Date.now()
    };
  }
}

module.exports = Response;