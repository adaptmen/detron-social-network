

enum RequestTypes {
    SUCCESS = 'success',
    ERROR = 'error',
    CREATE_GROUP = 'create_group',
    CREATE_POST = 'create_post',
    GET_WALL = 'get_wall',
    SYNC_NOTIFY = 'sync_notify',
    GET_NEWS = "get_news",
    NEW_MESSAGE = "new_message",
    SEND_MESSAGE = "send_message",
    UPDATE_USER_DATA = "update_user_data",
    CREATE_CHAT = "create_chat",
    OPEN_CHAT = "open_chat",
    GET_CHATS = "get_chats",
    GET_MESSAGES = "get_messages",
    USER_INIT = "user_init"
}

export default RequestTypes;