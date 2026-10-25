import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { StoreFooter, StoreHeader } from "./components/StoreComponents";
import Home from "./pages/Home";
import { AboutPage, CartPage, CategoriesPage, CheckoutPage, ConfirmationPage, ContactPage, CustomOrdersPage, MenuPage, ProductDetailPage, ShopPage, TrackOrderPage } from "./pages/StorePages";
import AdminPage from "./pages/Admin";
import AdminGalleryPage from "./pages/AdminGallery";
import HostingDashboard from "./pages/HostingDashboard";
import NotFound from "./pages/NotFound";

function PublicShell() {
  return <><StoreHeader /><main><Switch><Route path="/" component={Home} /><Route path="/shop" component={ShopPage} /><Route path="/menu" component={MenuPage} /><Route path="/categories" component={CategoriesPage} /><Route path="/product/:slug" component={ProductDetailPage} /><Route path="/cart" component={CartPage} /><Route path="/checkout" component={CheckoutPage} /><Route path="/custom-orders" component={CustomOrdersPage} /><Route path="/about" component={AboutPage} /><Route path="/contact" component={ContactPage} /><Route path="/track-order" component={TrackOrderPage} /><Route path="/order-confirmation" component={ConfirmationPage} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></main><StoreFooter /></>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><CartProvider><Toaster /><Switch><Route path="/admin/hosting" component={HostingDashboard} /><Route path="/admin/gallery" component={AdminGalleryPage} /><Route path="/admin" component={AdminPage} /><Route component={PublicShell} /></Switch></CartProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
