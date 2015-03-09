function NotFoundException(message) {
    this.message = message;
    this.name = 'NotFoundException';
    this.statusCode = 404;
}

module.exports = NotFoundException;
