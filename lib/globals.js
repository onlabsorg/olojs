
exports["import"] = async function (path, args) {
    const doc = await this.$env.load(this.path, path);
    return await doc.evaluate({args: args});
}

exports["require"] = async function (path) {
    return await this.$env.require(path);
}
