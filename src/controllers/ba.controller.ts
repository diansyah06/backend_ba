import { Request, Response } from "express";
import BaModel from "../models/ba.model";
import { IReqUser } from "../middlewares/auth.middleware";
import { sendSocketNotification } from "../utils/socketService";
import UserModel from "../models/user.model";

export default {
  // 1. User A membuat Berita Acara -> Notifikasi ke Vendor
  async create(req: IReqUser, res: Response) {
    try {
      const { nomorKontrak, jenisBa, vendorId } = req.body; // vendorId dikirim dari FE
      const creatorId = req.user?.id;

      // Simpan ke DB
      const newBa = await BaModel.create({
        nomorKontrak,
        jenisBa,
        vendor: vendorId,
        pembuat: creatorId,
        status: "Menunggu",
        tanggal: new Date()
      });

      // --- LOGIKA NOTIFIKASI ---
      
      // 1. Ambil data Vendor untuk mendapatkan target notifikasi
      const vendorData = await UserModel.findById(vendorId);
      
      // 2. Ambil data Pembuat (User A) untuk mendapatkan nama di pesan notifikasi (FIX ERROR DISINI)
      const creatorData = await UserModel.findById(creatorId);
      const creatorName = creatorData ? creatorData.fullname : "Seseorang"; 

      // Kirim notif ke Vendor jika vendor ditemukan
      if (vendorData) {
        // Pastikan konversi vendorId ke string agar sesuai dengan Map di socketService
        sendSocketNotification(vendorId.toString(), "notification", {
          title: "Berita Acara Baru",
          message: `User ${creatorName} telah membuat BA ${jenisBa} baru.`,
          baId: newBa._id
        });
      }

      res.status(201).json({ message: "BA Created", data: newBa });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },

  // 2. Vendor Menerima/Menolak -> Notifikasi ke User A (Pembuat)
  async updateStatus(req: IReqUser, res: Response) {
    try {
      const { id } = req.params; // ID Berita Acara
      const { status } = req.body; // 'Disetujui' atau 'Ditolak'
      
      const ba = await BaModel.findByIdAndUpdate(id, { status }, { new: true });
      
      if (!ba) return res.status(404).json({ message: "BA not found" });

      // --- LOGIKA NOTIFIKASI ---
      // Kirim notif balik ke Pembuat (User A)
      const creatorId = ba.pembuat.toString();
      
      sendSocketNotification(creatorId, "notification", {
        title: `Berita Acara ${status}`,
        message: `BA ${ba.nomorKontrak} telah ${status} oleh Vendor.`,
        baId: ba._id
      });

      res.status(200).json({ message: "Status Updated", data: ba });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};