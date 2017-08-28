


class customEvents {
    static trigger(obj,eventName,data) {
        obj.eventName(data);
    }
    static on(obj,eventName,callback) {  // on으로 이벤트 리스너 잡아주고 trigger로 이벤트발생
        obj.eventName = callback;
    }
}

export default customEvents;
