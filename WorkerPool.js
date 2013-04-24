/*global define*/
(function (window, undefined) {
    var setInterval = window.setInterval;
    var clearInterval = window.clearInterval;

    var WorkerPoll = function (workerUrl, poolSize) {
        this.size = poolSize || this.size;
        this.url = workerUrl;

        var timer = setInterval(function () {
            if (this.workerQueue.length < 10) {
                this.workerQueue.push(new window.Worker(this.url));
            } else {
                clearInterval(timer);
            }
        }.bind(this), 100);
    };

    WorkerPoll.prototype = {
        size : 10,
        taskQueue : [],
        workerQueue : [],
        addTask : function (message, callback, context) {
            if (this.workerQueue.length > 0) {
                this.runTask(message, callback, context);
            } else {
                this.taskQueue.push({
                    message : message,
                    callback : callback,
                    context : context
                });
            }
        },
        runTask : function (message, callback, context) {
            var worker = this.workerQueue.shift();

            var handler = function (evt) {
                callback.call(context || window, evt);
                worker.removeEventListener('message', handler);
                this.workerQueue.push(worker);
                if (this.taskQueue.length > 0) {
                    var task = this.taskQueue.shift();
                    this.runTask(task.message, task.callback, task.context);
                }
            }.bind(this);

            worker.addEventListener('message', handler);
            worker.postMessage(message);
        }
    };

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = WorkerPoll;
    } else {
        if (typeof define === 'function' && define.amd) {
            define('WorkerPoll', [], function () {
                return WorkerPoll;
            });
        }
    }

    if (typeof window === "object" && typeof window.document === "object") {
        window.WorkerPoll = WorkerPoll;
    }
}(this));
