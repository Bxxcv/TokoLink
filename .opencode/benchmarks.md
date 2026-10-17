# Benchmark & Penempatan Model — Tim AI TokoLink

Tanggal: 17 Okt 2026. Koordinator: Beam Free (`opencode/beam-free`).

## Model yang diizinkan (semua gratis, provider opencode)
| Model ID | Nama |
|---|---|
| opencode/beam-free | Beam Free |
| opencode/longcat-2.5-preview-free | LongCat 2.5 Preview Free |
| opencode/space-bunny-free | Space Bunny Free |
| opencode/mimo-v2.6-flash-free | MiMo-V2.6-Flash Free |
| opencode/deepseek-v4.1-flash-free | DeepSeek V4.1 Flash Free |
| opencode/glm-5.3-flash-free | GLM-5.3-Flash Free |
| opencode/nemotron-3.5-lightning-free | Nemotron 3.5 Lightning Free |
| opencode/nemotron-3-ultra-free | Nemotron 3 Ultra Free |
| opencode/nemotron-3.5-super-vl-free | Nemotron 3.5 Super VL Free |

Muse Spark, BangunWeb, Mistral, dan model berbayar: DILARANG (dihapus dari config).

## Penempatan peran (12 spesialis)
| Peran | Model | Alasan penempatan |
|---|---|---|
| frontend-dev | mimo-v2.6-flash-free | coding UI + kecepatan, temperatur 0.4 |
| backend-dev | deepseek-v4.1-flash-free | coding server/RPC, instruksi ketat |
| database-engineer | nemotron-3-ultra-free | analisis skema/transaksi berat |
| api-integration | deepseek-v4.1-flash-free | integrasi API, timeout/error handling |
| security-auditor | nemotron-3.5-super-vl-free | review mendalam, potensi vision |
| qa-engineer | glm-5.3-flash-free | uji & pelaporan terstruktur |
| bug-investigator | nemotron-3-ultra-free | pelacakan akar masalah |
| ui-ux-designer | mimo-v2.6-flash-free | review visual + mikro-copy |
| performance-engineer | deepseek-v4.1-flash-free | analisis indeks/agregat |
| product-manager | longcat-2.5-preview-free | opsi & trade-off |
| devops-engineer | nemotron-3.5-lightning-free | cepat, tugas infra sederhana |
| tech-writer | glm-5.3-flash-free | dokumentasi ringkas |

## Benchmark internal (uji identik)
Task: gunakan tool bash `printf '%s' 'TokoLink2026' | sha256sum`, lalu balas JSON `{"hash":"<hex>"}`. Bobot: kebenaran 40%, tool 25%, kepatuhan 15%, efisiensi 10%, konsistensi 10%.

Hasil (9/9 model berhasil memanggil tool dan mengembalikan hash benar `7ee7...d7d9`):
- beam-free: PASS
- longcat-2.5-preview-free: PASS
- space-bunny-free: PASS
- mimo-v2.6-flash-free: PASS
- deepseek-v4.1-flash-free: PASS
- glm-5.3-flash-free: PASS
- nemotron-3-ultra-free: PASS
- nemotron-3.5-super-vl-free: PASS
- nemotron-3.5-lightning-free: PASS (percobaan pertama timeout 120s, berhasil pada 180s — efisiensi lebih rendah)

Uji orkestrasi: koordinator memanggil 12 subagent paralel dengan task identik → 12/12 berhasil mengembalikan hasil, 0 gagal/timeout.

## Benchmark publik
Untuk varian gratis yang dipakai (suffix `-free` di provider opencode), skor publik tepercaya TIDAK TERSEDIA — tidak ada sumber yang memastikan varian gratis = model dasar. Jangan anggap skor model dasar berlaku.

Referensi (bukan skor varian gratis, hanya model dasar):
- Nemotron 3.5 Super VL (120B-A12B): SWE-bench Verified 71.07, LiveCodeBench v6 88.22, Terminal-Bench 2.1 60.80. Sumber: model card NVIDIA (build.nvidia.com/nvidia/nemotron-3.5-super-vl-120b-a12b/modelcard) + benchlm.ai. Tanggal evaluasi ~Okt 2026. Varian gratis di opencode belum diverifikasi setara.

## Fallback teruji
- nemotron-3.5-lightning-free: retry dengan timeout lebih panjang (180s) berhasil; tidak ada auto-fallback ke model lain yang diuji — koordinator harus retry manual bila timeout.
