package com.schoolgroup.sms.demo;

/**
 * Fictional Delhi NCR demo campuses. Not official school records.
 */
public final class DemoCampuses {

    private DemoCampuses() {
    }

    public static final String[][] BRANCHES = {
            {"NTH", "DPS North Delhi", "Model Town, North Delhi", "Delhi", "Delhi", "110009", "011-4300-1001", "north.demo@dps.local", "Dr. Meera Kapoor"},
            {"EST", "DPS East Delhi", "Preet Vihar, East Delhi", "Delhi", "Delhi", "110092", "011-4300-1002", "east.demo@dps.local", "Mr. Rohan Malhotra"},
            {"STH", "DPS South Delhi", "Saket, South Delhi", "Delhi", "Delhi", "110017", "011-4300-1003", "south.demo@dps.local", "Ms. Anjali Menon"},
            {"WST", "DPS West Delhi", "Janakpuri, West Delhi", "Delhi", "Delhi", "110058", "011-4300-1004", "west.demo@dps.local", "Dr. Vivek Bhatia"},
            {"CTR", "DPS Main Campus", "Mathura Road, New Delhi", "New Delhi", "Delhi", "110003", "011-4300-1000", "main.demo@dps.local", "Dr. Kavita Rao"},
            {"LKV", "DPS Noida", "Sector 27, Noida", "Noida", "Uttar Pradesh", "201301", "0120-430-1006", "noida.demo@dps.local", "Mr. Sandeep Iyer"},
            {"HLS", "DPS Greater Noida", "Knowledge Park, Greater Noida", "Greater Noida", "Uttar Pradesh", "201310", "0120-430-1007", "gnoida.demo@dps.local", "Ms. Priya Nair"},
            {"RVR", "DPS Gurgaon", "Sushant Lok, Gurugram", "Gurugram", "Haryana", "122002", "0124-430-1008", "gurgaon.demo@dps.local", "Dr. Amit Sharma"}
    };

    public static final int STUDENTS_PER_BRANCH = 530;

    public static final String[] CLASS_NAMES = {
            "Nursery", "LKG", "UKG",
            "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
            "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
            "Class 11", "Class 12"
    };

    public static final int[] GRADE_LEVELS = {-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};

    /** Must sum to 530. */
    public static final int[] CLASS_QUOTAS = {28, 28, 28, 32, 32, 32, 36, 36, 40, 40, 40, 42, 42, 38, 36};

    public static final String[][] SECTION_SETS = {
            {"A", "B"},
            {"A", "B"},
            {"A", "B"},
            {"A", "B", "C"},
            {"A", "B", "C"},
            {"A", "B", "C"},
            {"A", "B", "C"},
            {"A", "B", "C"},
            {"A", "B", "C", "D"},
            {"A", "B", "C", "D"},
            {"A", "B", "C", "D"},
            {"A", "B", "C"},
            {"A", "B", "C"},
            {"A", "B", "C"},
            {"A", "B", "C"}
    };

    public static final String[][] SUBJECTS = {
            {"Mathematics", "MATH"},
            {"English", "ENG"},
            {"Science", "SCI"},
            {"Hindi", "HIN"},
            {"Social Science", "SST"},
            {"Computer Science", "CS"},
            {"Physical Education", "PE"},
            {"Art", "ART"}
    };

    public static final String[] TEACHER_FIRST = {
            "Kavita", "Rohan", "Neha", "Amit", "Sana", "Vikram", "Pooja", "Arun", "Divya", "Nikhil", "Ishita", "Harsh"
    };

    public static final String[] BOYS = {
            "Aarav", "Vihaan", "Arjun", "Kabir", "Advait", "Reyansh", "Ishaan", "Dhruv", "Shaurya", "Atharv",
            "Vivaan", "Ayaan", "Rudra", "Krish", "Dev", "Yash", "Om", "Aryan", "Neil", "Kabir"
    };

    public static final String[] GIRLS = {
            "Ananya", "Myra", "Aadhya", "Siya", "Diya", "Kiara", "Anvi", "Sara", "Ira", "Navya",
            "Aisha", "Meera", "Riya", "Tara", "Nisha", "Pari", "Saanvi", "Avni", "Inaaya", "Zara"
    };

    public static final String[] LAST = {
            "Sharma", "Verma", "Kapoor", "Singh", "Mehta", "Gupta", "Joshi", "Nair", "Iyer", "Reddy",
            "Khan", "Patel", "Rao", "Malhotra", "Bhatia", "Chopra", "Das", "Mishra", "Banerjee", "Kulkarni"
    };

    public static final String[] BLOOD = {"A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"};
}
