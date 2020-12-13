package models;

public class HighscoreData {


    public String[][] getTableData() {
        String[][] data = new String[10][2];

        for (int i = 0; i < data.length; i++) {
            data[i][0] = "User " + i;
            data[i][1] = randomScore();
        }
        return data;
    }

    public String randomScore() {
        return String.valueOf((int) Math.floor(Math.random() * 1001));
    }
}
