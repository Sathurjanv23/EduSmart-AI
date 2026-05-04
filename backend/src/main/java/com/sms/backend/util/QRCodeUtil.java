package com.sms.backend.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

import javax.imageio.ImageIO;

public class QRCodeUtil {

    public static String generateQRCode(String data) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.MARGIN, 1);
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, 220, 220, hints);
            BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "png", outputStream);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (WriterException | java.io.IOException exception) {
            throw new IllegalStateException("Failed to generate QR code", exception);
        }
    }

    public static String generateQRCodeForAttendance(String classId, String date) {
        return generateQRCode("CLASS_" + classId + "_" + date);
    }

    public static String generateQRCodeForExam(String examId) {
        return generateQRCode("EXAM_" + examId);
    }

    public static String generateQRCodeForAssignment(String assignmentId) {
        return generateQRCode("ASSIGNMENT_" + assignmentId);
    }
}
