import mongoose from "mongoose";

export interface IBeritaAcara {
  nomorKontrak: string;
  jenisBa: string;
  vendor: mongoose.Types.ObjectId; // Referensi ke User (Vendor)
  pembuat: mongoose.Types.ObjectId; // Referensi ke User (Pembuat/User A)
  tanggal: Date;
  status: "Menunggu" | "Disetujui" | "Ditolak";
}

const Schema = mongoose.Schema;

const BaSchema = new Schema<IBeritaAcara>(
  {
    nomorKontrak: { type: String, required: true },
    jenisBa: { type: String, required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "user", required: true },
    pembuat: { type: Schema.Types.ObjectId, ref: "user", required: true },
    tanggal: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Menunggu", "Disetujui", "Ditolak"],
      default: "Menunggu",
    },
  },
  { timestamps: true }
);

const BaModel = mongoose.model("BeritaAcara", BaSchema);
export default BaModel;