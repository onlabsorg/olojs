
const Path = require("./Path");



class Change {

    constructor (key, op) {
        this.key = key;
        this.op = op;
    }

    get path () {
        var change = this;
        var changePath = new Path();
        while (change.op instanceof Change) {
            changePath = new Path(changePath, change.key);
            change = change.op;
        }
        changePath = new Path(changePath, change.key);
        return changePath;
    }

    get type () {
        return this.op.type;
    }

    get del () {
        return this.op.del;
    }

    get ins () {
        return this.op.ins;
    }

    getSubChange (path) {
        path = Path.from(path);
        var thisPath = this.path;

        if (thisPath.equals(path)) {
            return new Change('', {del:this.del, ins:this.ins});
        }

        if (thisPath.isSubPathOf(path)) {
            var subChange = this;
            for (let key of path) {
                subChange = subChange.op;
            }
            return subChange;
        }

        if (path.isSubPathOf(thisPath)) {
            const subChangePath = path.slice(thisPath.length);
            var op = {del: this.del, ins: this.ins};
            for (let key of subChangePath) {
                try {
                    op.del = op.del[key];
                    op.ins = op.ins[key];
                }
                catch (error) {
                    return null;
                }
            }
            return op.del === op.ins ? null : new Change('', op);
        }

        return null;
    }
}


module.exports = Change;
