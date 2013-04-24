/*global define*/
(function (window, undefined) {
    var setInterval = window.setInterval;
    var clearInterval = window.clearInterval;

    var WorkerPoll = function (workerUrl, poolSize) {
        var self = this;
        this.size = poolSize || this.size;
        this.url = workerUrl;

        var timer = setInterval(function () {
            if (self.workerQueue.length < 10) {
                self.workerQueue.push(new window.Worker(self.url));
            } else {
                clearInterval(timer);
            }
        }, 100);
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
            var self = this;
            var worker = this.workerQueue.shift();

            var handler = function (evt) {
                callback.call(context || window, evt);
                worker.removeEventListener('message', handler);
                self.workerQueue.push(worker);
                if (self.taskQueue.length > 0) {
                    var task = self.taskQueue.shift();
                    self.runTask(task.message, task.callback, task.context);
                }
            };

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
