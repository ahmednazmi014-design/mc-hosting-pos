import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, ChevronDown, Menu, MessageCircle, Search, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart, formatPKR, type StoreProduct } from "@/contexts/CartContext";
import { toast } from "sonner";

const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/[^0-9]/g, "") || "923291955194";
const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "/contact";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 focus-ring" aria-label="MC Hosting home">
      <img src="/manus-storage/776351307_18079757510427620_1213110455707678413_n(1)_d367e089.jpg" alt="MC Hosting logo" className="h-11 w-11 rounded-[4px] object-contain" />
      <span className={`text-[19px] font-extrabold tracking-[-0.06em] ${inverse ? "text-white" : "text-[#234E52]"}`}>FRIXO<span className={inverse ? "text-[#F6BD60]" : "text-primary"}>.PK</span></span>
    </Link>
  );
}

const navItems = [
  ["Shop", "/shop"],
  ["Menu", "/menu"],
  ["Categories", "/categories"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { itemCount } = useCart();
  return (
    <>
      <div className="bg-[#234E52] px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-[#FFF8ED]">Demo mode · sample catalogue <span className="mx-2 text-[#F6BD60]">•</span> Free delivery on orders over Rs. 5,000 <span className="mx-2 text-[#F6BD60]">•</span> Cash on Delivery available</div>
      <header className="sticky top-0 z-40 border-b border-[#e8e5de]/90 bg-[#fffdf9]/95 backdrop-blur-md">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <BrandLogo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            <Link href="/" className={`focus-ring text-sm font-semibold ${location === "/" ? "text-primary" : "text-[#526160] hover:text-[#234E52]"}`}>Home</Link>
            {navItems.map(([label, href]) => <Link key={href} href={href} className={`focus-ring text-sm font-semibold ${location.startsWith(href) ? "text-primary" : "text-[#526160] hover:text-[#234E52]"}`}>{label}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/shop" className="focus-ring hidden h-10 w-10 items-center justify-center text-[#234E52] hover:bg-[#f6f1e9] sm:flex" aria-label="Search products"><Search className="h-[18px] w-[18px]" /></Link>
            <Link href="/cart" className="focus-ring relative flex h-10 w-10 items-center justify-center text-[#234E52] hover:bg-[#f6f1e9]" aria-label={`Cart with ${itemCount} items`}><ShoppingBag className="h-[19px] w-[19px]" />{itemCount > 0 && <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{itemCount}</span>}</Link>
            <Link href="/shop" className="button-press hidden h-10 items-center gap-2 bg-primary px-4 text-xs font-bold text-white hover:bg-[#c94f03] sm:flex">Shop Minecraft hosting <ArrowRight className="h-3.5 w-3.5" /></Link>
            <button onClick={() => setMenuOpen(value => !value)} className="focus-ring flex h-10 w-10 items-center justify-center text-[#234E52] lg:hidden" aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-border bg-[#fffdf9] px-4 py-4 lg:hidden"><nav className="container flex flex-col gap-1">{[["Home", "/"], ...navItems].map(([label, href]) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className="focus-ring border-b border-border/70 py-3 text-sm font-semibold text-[#234E52]">{label}</Link>)}<Link onClick={() => setMenuOpen(false)} href="/cart" className="focus-ring py-3 text-sm font-semibold text-primary">View cart {itemCount ? `(${itemCount})` : ""}</Link></nav></div>}
      </header>
      <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="Open support" className="focus-ring fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(20,100,55,0.28)] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#1ebe5d]"><MessageCircle className="h-5 w-5" /> <span className="hidden sm:inline">Open support</span></a>
    </>
  );
}

export function StoreFooter() {
  return <footer className="mt-20 bg-[#234E52] text-[#f8f4ec]"><div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><BrandLogo inverse /><p className="mt-5 max-w-xs text-sm leading-6 text-[#c6d2ce]">Minecraft worlds for family tables, quick meals, and every gathering in between.</p><div className="mt-6 flex gap-2"><span className="rounded-sm bg-[#2e5f61] px-3 py-2 text-[11px] font-bold text-[#F6BD60]">PAKISTAN</span><span className="rounded-sm bg-[#2e5f61] px-3 py-2 text-[11px] font-bold text-[#c6d2ce]">CASH ON DELIVERY</span></div></div><FooterColumn title="Explore" links={[["Shop", "/shop"], ["Current menu", "/menu"], ["Categories", "/categories"], ["Track an order", "/track-order"]]} /><FooterColumn title="Company" links={[["About MC Hosting", "/about"], ["Contact", "/contact"]]} /><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#F6BD60]">Order now</p><a href="tel:03291955194" className="mt-4 block text-lg font-extrabold text-white hover:text-[#F6BD60]">support@mc-hosting.local</a><a href={whatsappHref} target={whatsappNumber ? "_blank" : undefined} rel={whatsappNumber ? "noreferrer" : undefined} className="focus-ring mt-4 inline-flex items-center gap-2 border border-[#5a7b78] px-3 py-2 text-xs font-bold text-white hover:border-[#F6BD60]"><MessageCircle className="h-4 w-4 text-[#F6BD60]" /> {whatsappNumber ? "Open support" : "WhatsApp details soon"}</a><p className="mt-4 text-sm text-[#c6d2ce]">Mon–Sat · 10am–7pm</p></div></div><div className="border-t border-[#3c6263]"><div className="container flex flex-col gap-2 py-5 text-xs text-[#a9bfba] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} MC HOSTING. All rights reserved.</span><span>Minecraft hosting in Pakistan</span></div></div></footer>;
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) { return <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#F6BD60]">{title}</p><div className="mt-4 flex flex-col gap-3">{links.map(([label, href]) => <Link key={href} href={href} className="focus-ring w-fit text-sm text-[#c6d2ce] hover:text-white">{label}</Link>)}</div></div>; }

export function PageIntro({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) { return <section className="border-b border-border bg-[#f6f1e9]/55"><div className="container py-14 md:py-20"><p className="eyebrow">{eyebrow}</p><h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.06] text-[#234E52] md:text-6xl">{title}</h1><p className="section-lede">{lede}</p></div></section>; }

export function ProductCard({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const onAdd = () => { addItem(product); setAdded(true); toast.success(`${product.name} added to cart`); window.setTimeout(() => setAdded(false), 1400); };
  return <article className="group relative flex flex-col border border-border bg-white shadow-[0_5px_20px_rgba(35,78,82,0.04)] transition-shadow duration-200 hover:shadow-[0_14px_35px_rgba(35,78,82,0.1)]"><Link href={`/product/${product.slug}`} className="focus-ring relative overflow-hidden bg-[#f6f1e9]"><img src={product.imageUrl} alt={product.name} loading="lazy" className="product-image group-hover:scale-[1.035]" />{!product.available && <span className="absolute left-3 top-3 bg-[#234E52] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Unavailable</span>}{product.featured && product.available && <span className="absolute left-3 top-3 bg-[#F6BD60] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#234E52]">Popular</span>}</Link><div className="flex flex-1 flex-col p-4 md:p-5"><div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.13em] text-primary">{product.category}</span><span className="text-[11px] font-semibold text-muted-foreground">{product.packSize}</span></div><Link href={`/product/${product.slug}`} className="focus-ring"><h3 className="text-[18px] font-extrabold text-[#234E52] hover:text-primary">{product.name}</h3></Link><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{product.description}</p><div className="mt-auto flex items-end justify-between gap-3 pt-5"><div><p className="text-[11px] text-muted-foreground">From</p><p className="text-lg font-extrabold text-[#234E52]">{formatPKR(product.price)}</p></div><Button disabled={!product.available} onClick={onAdd} className="button-press h-10 rounded-sm bg-primary px-3 text-xs font-bold text-white hover:bg-[#c94f03]">{added ? <><Check className="mr-1 h-3.5 w-3.5" /> Added</> : "Add to cart"}</Button></div></div></article>;
}

export function QuantityControl({ quantity, onChange }: { quantity: number; onChange: (quantity: number) => void }) { return <div className="flex h-9 items-center border border-border"><button onClick={() => onChange(quantity - 1)} className="focus-ring h-full w-8 text-lg text-[#234E52] hover:bg-muted" aria-label="Decrease quantity">−</button><span className="w-8 text-center text-sm font-bold text-[#234E52]">{quantity}</span><button onClick={() => onChange(quantity + 1)} className="focus-ring h-full w-8 text-lg text-[#234E52] hover:bg-muted" aria-label="Increase quantity">+</button></div>; }

export function SectionRule({ label, href }: { label: string; href?: string }) { return <div className="mb-8 flex items-center justify-between border-b border-border pb-4"><p className="eyebrow">{label}</p>{href && <Link href={href} className="focus-ring flex items-center gap-1 text-xs font-bold text-[#234E52] hover:text-primary">View all <ArrowRight className="h-3.5 w-3.5" /></Link>}</div>; }
