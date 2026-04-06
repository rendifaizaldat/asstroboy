import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Store,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Printer,
  Maximize,
} from "lucide-react";
import { PRODUCTS, CATEGORIES, TOPPINGS, APP_CONFIG } from "./data/mockData";
import { useCartStore } from "./store/useCartStore";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const App = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    toggleTopping,
  } = useCartStore();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Simulation States
  const [paymentModal, setPaymentModal] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [queueNumber, setQueueNumber] = useState(101);

  // Fullscreen states & functions
  const [showFullscreenOverlay, setShowFullscreenOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setShowFullscreenOverlay(false);
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Filter Produk
  const filteredProducts =
    activeCategory === "Semua"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const totalPrice = cart.reduce((acc, item) => {
    const toppingTotal = item.selectedToppings.reduce(
      (tAcc, t) => tAcc + t.price,
      0,
    );
    return acc + (item.price + toppingTotal) * item.qty;
  }, 0);

  const processPayment = (method) => {
    setSelectedMethod(method);
    setPaymentModal("PROCESS");
    setTimeout(() => {
      if (method === "QRIS") setPaymentModal("QRIS_DISPLAY");
      else setPaymentModal("STAFF_SIM");
    }, 2000);
  };

  const finalizeTransaction = () => {
    setPaymentModal("DONE");
  };

  const closeAllAndReset = () => {
    setPaymentModal(null);
    clearCart();
    setQueueNumber((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
            <Store size={22} />
          </div>
          <h1 className="font-bold text-lg text-dark tracking-tight">
            {APP_CONFIG.branchName}
          </h1>
        </div>

        {/* LOGIKA TOMBOL DI HEADER */}
        <div className="flex items-center gap-4">
          {isFullscreen ? (
            <button
              onClick={exitFullscreen}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all"
            >
              <Maximize size={12} /> Keluar Fullscreen
            </button>
          ) : (
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              POS SIMULATOR V1.0
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* LEFT AREA: KATALOG (SCROLLABLE) */}
        <section className="flex-1 lg:w-[70%] flex flex-col overflow-hidden">
          <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap uppercase tracking-wider",
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-24">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-primary/30"
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-dark text-sm px-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-primary font-black px-1">
                  Rp {product.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT AREA: LIVE STRUK (FIXED) */}
        <aside
          className={cn(
            "fixed inset-0 z-50 bg-white lg:relative lg:translate-x-0 lg:w-[32%] xl:w-[25%] lg:flex lg:flex-col border-l shadow-2xl transition-transform duration-300",
            isMobileCartOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
            {/* Header Struk */}
            <div className="p-4 border-b bg-white flex justify-between items-center shrink-0">
              <h2 className="font-black text-lg italic text-dark uppercase tracking-tighter flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" /> LIVE STRUK
              </h2>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="lg:hidden p-2 bg-slate-100 rounded-full"
              >
                ✕
              </button>
            </div>
            {/* LIST ITEM PESANAN */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <ShoppingCart
                    size={48}
                    strokeWidth={1}
                    className="mb-2 opacity-20"
                  />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Kosong
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 relative group"
                  >
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex gap-2 mb-2 pr-6">
                      <img
                        src={item.image}
                        className="w-10 h-10 rounded-lg object-cover border"
                        alt={item.name}
                      />
                      <div>
                        <h4 className="font-black text-[11px] text-dark leading-tight uppercase line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] font-bold text-primary">
                          Rp {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Control Qty */}
                    <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border">
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => updateQty(item.cartId, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-white rounded border text-slate-400"
                        >
                          -
                        </button>
                        <span className="font-black text-xs w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.cartId, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-primary rounded text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Toppings */}
                    {item.category === "Ice Cream" && (
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-100">
                        <div className="flex flex-wrap gap-1">
                          {TOPPINGS.map((top) => {
                            const isSelected = item.selectedToppings.find(
                              (t) => t.id === top.id,
                            );
                            return (
                              <button
                                key={top.id}
                                onClick={() => toggleTopping(item.cartId, top)}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-bold border transition-all",
                                  isSelected
                                    ? "bg-accent/20 border-accent text-dark"
                                    : "bg-white border-slate-200 text-slate-400",
                                )}
                              >
                                {top.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* FOOTER STRUK */}
            <div className="p-4 bg-white border-t rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] shrink-0">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  Total
                </span>
                <span className="text-xl font-black text-dark tracking-tighter">
                  Rp {totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-100 font-black text-slate-400 uppercase text-[10px] tracking-widest active:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => cart.length > 0 && setPaymentModal("SELECT")}
                  className="flex-[2] py-3 bg-dark text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE TRIGGER */}
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-40"
        >
          <ShoppingCart size={28} />
        </button>
      </main>

      {/* --- SIMULATION MODALS --- */}
      {paymentModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          {paymentModal === "SELECT" && (
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 animate-in zoom-in duration-300 shadow-2xl">
              <h2 className="text-2xl font-black text-center mb-8 italic uppercase tracking-tighter">
                Metode Pembayaran
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    id: "CASH",
                    icon: <Banknote />,
                    label: "Tunai / Cash",
                    sub: "Bayar di kasir",
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    id: "EDC",
                    icon: <CreditCard />,
                    label: "Debit / EDC",
                    sub: "Gesek kartu",
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    id: "QRIS",
                    icon: <QrCode />,
                    label: "QRIS Otomatis",
                    sub: "Scan instan",
                    color: "bg-purple-100 text-purple-600",
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => processPayment(m.id)}
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-primary transition-all active:bg-slate-50 text-left"
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        m.color,
                      )}
                    >
                      {m.icon}
                    </div>
                    <div>
                      <p className="font-black text-dark uppercase">
                        {m.label}
                      </p>
                      <p className="text-xs text-slate-400">{m.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPaymentModal(null)}
                className="w-full mt-6 text-slate-400 font-bold text-sm"
              >
                Batal
              </button>
            </div>
          )}

          {paymentModal === "PROCESS" && (
            <div className="text-center text-white">
              <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl font-black uppercase tracking-widest animate-pulse">
                Memproses Pembayaran...
              </p>
            </div>
          )}

          {paymentModal === "QRIS_DISPLAY" && (
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center animate-in zoom-in shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-dark">QRIS DINAMIS</span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg"
                  className="h-4"
                  alt="QRIS"
                />
              </div>
              <div className="bg-white p-6 rounded-3xl mb-6 inline-block border-4 border-slate-50 shadow-inner">
                <QrCode size={180} className="text-dark" />
              </div>
              <p className="text-3xl font-black text-primary mb-8 underline decoration-slate-100 underline-offset-8">
                Rp {totalPrice.toLocaleString()}
              </p>
              <button
                onClick={finalizeTransaction}
                className="w-full py-4 bg-accent text-dark font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest"
              >
                Simulasi Scan Berhasil
              </button>
            </div>
          )}

          {paymentModal === "STAFF_SIM" && (
            <div className="bg-slate-900 border-2 border-primary/50 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
              <div className="bg-primary p-4 text-center">
                <p className="text-[10px] font-black text-white tracking-[0.3em] uppercase">
                  Simulasi App Staff
                </p>
              </div>
              <div className="p-8">
                <h3 className="text-white font-black text-xl mb-6 italic tracking-tight uppercase">
                  Validasi {selectedMethod}
                </h3>
                <div className="flex justify-between items-end mb-8 border-b border-slate-700 pb-6">
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                    Tagihan
                  </span>
                  <span className="text-3xl font-black text-green-400">
                    Rp {totalPrice.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={finalizeTransaction}
                  className="w-full py-5 bg-green-500 text-white font-black rounded-2xl shadow-lg uppercase tracking-widest active:scale-95"
                >
                  Konfirmasi & Cetak Struk
                </button>
              </div>
            </div>
          )}

          {paymentModal === "DONE" && (
            <div className="bg-white rounded-3xl w-full max-w-sm p-2 animate-in zoom-in shadow-2xl overflow-hidden">
              <div className="border-4 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center bg-white">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={28} />
                  </div>
                  <p className="font-black text-dark uppercase tracking-tighter text-lg">
                    Pesanan Diterima
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {APP_CONFIG.branchName}
                  </p>
                </div>

                <div className="w-full bg-slate-900 text-white rounded-2xl py-6 mb-4 text-center shadow-lg border-b-4 border-primary">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-1">
                    Nomor Antrian
                  </p>
                  <h1 className="text-7xl font-black tracking-tighter">
                    {queueNumber}
                  </h1>
                </div>

                <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 text-left font-mono text-[11px]">
                  <p className="text-center border-b border-dashed border-slate-300 pb-2 mb-2 font-bold uppercase">
                    Rincian Pembelian
                  </p>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {cart.map((item) => {
                      const itemToppingTotal = item.selectedToppings.reduce(
                        (tAcc, t) => tAcc + t.price,
                        0,
                      );
                      return (
                        <div key={item.cartId}>
                          <div className="flex justify-between font-bold text-dark uppercase">
                            <span>
                              {item.qty}x {item.name}
                            </span>
                            <span>
                              Rp {(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                          {item.selectedToppings.map((t) => (
                            <div
                              key={t.id}
                              className="flex justify-between text-slate-400 pl-4 italic"
                            >
                              <span>+ {t.name}</span>
                              <span>
                                Rp {(t.price * item.qty).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-dashed border-slate-300 mt-4 pt-2 space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>METODE:</span>
                      <span className="font-bold">{selectedMethod}</span>
                    </div>
                    <div className="flex justify-between text-dark font-black text-sm border-t border-slate-200 pt-1 mt-1">
                      <span>TOTAL</span>
                      <span>Rp {totalPrice.toLocaleString()}</span>
                    </div>

                    {selectedMethod === "CASH" && (
                      <>
                        <div className="flex justify-between text-slate-500">
                          <span>BAYAR</span>
                          <span>Rp {(totalPrice + 5000).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-bold">
                          <span>KEMBALIAN</span>
                          <span>Rp {(5000).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 w-full space-y-2">
                  <button
                    onClick={closeAllAndReset}
                    className="w-full py-4 bg-dark text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                  >
                    Selesai & Pesanan Baru
                  </button>
                  <p className="text-[9px] text-slate-400 text-center font-bold italic">
                    Simpan struk ini sebagai bukti pengambilan
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OVERLAY INISIALISASI FULLSCREEN */}
      {showFullscreenOverlay && !isFullscreen && (
        <div className="fixed inset-0 z-[999] bg-dark flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Maximize size={40} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-dark mb-2 uppercase tracking-tighter">
              Siap Presentasi?
            </h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Klik tombol di bawah untuk mengaktifkan{" "}
              <b>Mode Kios Fullscreen</b> agar tampilan maksimal di tablet.
            </p>
            <button
              onClick={enterFullscreen}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 active:scale-95 transition-all"
            >
              Mulai Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
