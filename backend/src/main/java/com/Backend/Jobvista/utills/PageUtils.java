package com.Backend.Jobvista.utills;

public class PageUtils {

    private static final int DEFAULT_SIZE = 10;
    private static final int MAX_SIZE = 50;
    private static final int ADMIN_MAX_SIZE = 100;

    public static int sanitize(int size) {
        if (size <= 0) return DEFAULT_SIZE;
        return Math.min(size, MAX_SIZE);
    }

    public static int sanitizeAdmin(int size) {
        if (size <= 0) return DEFAULT_SIZE;
        return Math.min(size, ADMIN_MAX_SIZE);
    }

    public static int sanitizePage(int page) {
        return Math.max(0, page);
    }
}