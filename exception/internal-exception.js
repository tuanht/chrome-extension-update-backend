function IntenalException(message) {
    this.message = message;
    this.name = 'IntenalException';
    this.statusCode = 500;
}

module.exports = IntenalException;
