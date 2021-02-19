package models;

import java.sql.ResultSet;
import java.sql.SQLException;

public class Message {
    private final int sender;
    private final int receiver;
    private String senderName;
    private String receiverName;
    private final String time;
    private final String message_text;

    public Message(ResultSet rs) throws SQLException {
        this.sender = rs.getInt("sender");
        this.receiver = rs.getInt("receiver");
        this.time = rs.getString("time");
        this.message_text = rs.getString("message_text");
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public int getSender() {
        return sender;
    }

    public int getReceiver() {
        return receiver;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public String getTime() {
        return time;
    }

    public String getMessage_text() {
        return message_text;
    }
}
