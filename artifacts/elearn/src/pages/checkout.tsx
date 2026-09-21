import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { ArrowRight } from 'lucide-react';
import {
  checkout,
  getOrder,
  simulatePayment,
  validateCoupon,
} from '@workspace/api-client-react';
import type { CheckoutResult } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { Footer, Header } from '@/components/site-chrome';
import { useCourseDetail } from '@/hooks/use-catalog';
import { useMyEnrollments } from '@/hooks/use-learning';
import { mockCourses } from '@/lib/mock-catalog';
import { minorToMajor, money } from '@/lib/catalog';
import { toApiErrorInfo } from '@/lib/auth-session';
import NotFound from '@/pages/not-found';

const METHODS = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'tigopesa', label: 'Tigo Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'halopesa', label: 'HaloPesa' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank transfer' },
] as const;

const MOBILE_METHODS = new Set(['mpesa', 'tigopesa', 'airtel', 'halopesa']);
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

type Phase =
  | { name: 'form' }
  | { name: 'waiting'; order: CheckoutResult }
  | { name: 'paid'; order: CheckoutResult }
  | { name: 'failed'; message: string };

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const [location, setLocation] = useLocation();
  const { status, user } = useAuth();
  const { course, isLoading: courseLoading } = useCourseDetail(
    slug,
    mockCourses.find((item) => item.slug === slug),
  );
  const { enrolledCourseIds, refetch: refetchEnrollments } = useMyEnrollments();

  const [method, setMethod] = useState<string>('mpesa');
  const [phone, setPhone] = useState('+255');
  const [coupon, setCoupon] = useState('');
  const [discountMinor, setDiscountMinor] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [phase, setPhase] = useState<Phase>({ name: 'form' });
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);
  const [polls, setPolls] = useState(0);

  // Guests complete auth first, then land back here.
  useEffect(() => {
    if (status === 'anon')
      setLocation(`/register?next=${encodeURIComponent(location)}`);
  }, [status, setLocation, location]);

  const alreadyEnrolled = !!course?.id && enrolledCourseIds.has(course.id);
  const priceMinor = course ? Math.round(course.price * 100) : 0;
  const totalMinor = Math.max(0, priceMinor - discountMinor);

  const waitingOrder = phase.name === 'waiting' ? phase.order : null;

  // Poll the order until it settles (§5.4: poll every 3s).
  useEffect(() => {
    if (!waitingOrder) return;
    if (polls >= MAX_POLLS) {
      setPhase({ name: 'failed', message: 'We are still waiting on the payment provider. Your order is saved — try polling again later from support.' });
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const order = await getOrder(waitingOrder.orderId);
        if (order.status === 'paid') {
          refetchEnrollments();
          setPhase({ name: 'paid', order });
        } else if (order.status === 'failed' || order.status === 'expired') {
          setPhase({ name: 'failed', message: `Payment ${order.status}. No money was taken — you can try again.` });
        } else {
          setPolls((n) => n + 1);
        }
      } catch {
        setPolls((n) => n + 1);
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [waitingOrder, polls, refetchEnrollments]);

  const applyCoupon = async () => {
    if (!coupon.trim() || !user) return;
    setCouponMessage('');
    try {
      const res = await validateCoupon({ code: coupon.trim(), subtotal: priceMinor, userId: user.id });
      setDiscountMinor(res.discount);
      setCouponMessage(
        res.discount > 0
          ? `Coupon applied — you save ${money(minorToMajor(res.discount))}.`
          : 'Coupon is valid but gives no discount on this order.',
      );
    } catch (error) {
      setDiscountMinor(0);
      setCouponMessage(toApiErrorInfo(error).message);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending || !course?.id) return;
    if (MOBILE_METHODS.has(method) && !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''))) {
      setFormError('Enter a valid phone number for mobile money (e.g. +255700000000).');
      return;
    }
    setPending(true);
    setFormError('');
    try {
      const order = await checkout(
        {
          items: [{ type: 'course', id: course.id, quantity: 1 }],
          couponCode: coupon.trim() || null,
          paymentMethod: method,
          phone: phone.trim() || null,
          orgId: null,
          returnUrl: null,
        },
        { headers: { 'Idempotency-Key': crypto.randomUUID() } },
      );
      setPolls(0);
      setPhase({ name: 'waiting', order });
    } catch (error) {
      const info = toApiErrorInfo(error);
      if (info.status === 409 || info.type === 'already_enrolled') {
        refetchEnrollments();
        setFormError('You are already enrolled in this course.');
      } else {
        setFormError(info.message);
      }
    } finally {
      setPending(false);
    }
  };

  const simulate = async () => {
    if (!waitingOrder) return;
    try {
      await simulatePayment(waitingOrder.orderId);
      const order = await getOrder(waitingOrder.orderId);
      if (order.status === 'paid') {
        refetchEnrollments();
        setPhase({ name: 'paid', order });
      }
    } catch (error) {
      setFormError(toApiErrorInfo(error).message);
    }
  };

  if (status === 'loading' || courseLoading) {
    return (
      <div className="app-shell">
      <Header />
        <main>
          <section className="container-wide">
            <p data-testid="status-checkout-loading">Loading checkout…</p>
          </section>
        </main>
      <Footer />
      </div>
    );
  }
  if (status !== 'authed') return null; // redirecting to register
  if (!course) return <NotFound />;

  return (
    <div className="app-shell">
      <Header />
      <main>
        <section className="container-wide">
          <Link href={`/courses/${course.slug}`} className="back-link" data-testid="link-back-course">
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to course
          </Link>
          <p className="eyebrow">Checkout</p>
          <h1 className="display" data-testid="text-checkout-title">
            {alreadyEnrolled || phase.name === 'paid' ? 'You are in.' : `Enroll in ${course.title}`}
          </h1>

          {alreadyEnrolled && phase.name !== 'paid' ? (
            <div className="enroll-card" data-testid="status-already-enrolled">
              <p className="eyebrow">Already enrolled</p>
              <p>You already have access to this course.</p>
              <Link href="/learning" className="button button-primary" data-testid="link-go-learning">
                Go to My Learning <ArrowRight size={16} />
              </Link>
            </div>
          ) : phase.name === 'paid' ? (
            <div className="enroll-card" data-testid="status-payment-success">
              <p className="eyebrow">Payment confirmed</p>
              <p>
                Order {phase.order.number} is paid. {course.title} is now yours.
              </p>
              <Link href="/learning" className="button button-primary" data-testid="link-go-learning">
                Start learning <ArrowRight size={16} />
              </Link>
            </div>
          ) : phase.name === 'failed' ? (
            <div className="enroll-card" data-testid="status-payment-failed">
              <p className="eyebrow">Payment did not go through</p>
              <p>{phase.message}</p>
              <button
                className="button button-primary"
                onClick={() => setPhase({ name: 'form' })}
                data-testid="button-retry-checkout"
              >
                Try again
              </button>
            </div>
          ) : phase.name === 'waiting' ? (
            <div className="enroll-card" data-testid="status-payment-pending">
              <p className="eyebrow">Waiting for payment</p>
              <p>{phase.order.paymentInstruction}</p>
              <div className="meta-list">
                <div className="meta-row">
                  <span>Order</span>
                  <span data-testid="text-order-number">{phase.order.number}</span>
                </div>
                <div className="meta-row">
                  <span>Total</span>
                  <span>{money(minorToMajor(phase.order.total))}</span>
                </div>
              </div>
              <p className="auth-subtitle">Approve the payment on your phone. This page updates automatically.</p>
              {import.meta.env.DEV && (
                <button
                  className="button button-ghost button-small"
                  onClick={simulate}
                  data-testid="button-simulate-payment"
                >
                  Simulate provider approval (dev)
                </button>
              )}
            </div>
          ) : (
            <div className="enroll-card" data-testid="form-checkout">
              <div className="meta-list">
                <div className="meta-row">
                  <span>Course</span>
                  <span>{course.title}</span>
                </div>
                <div className="meta-row">
                  <span>Price</span>
                  <span>{money(course.price)}</span>
                </div>
                {discountMinor > 0 && (
                  <div className="meta-row">
                    <span>Coupon</span>
                    <span>−{money(minorToMajor(discountMinor))}</span>
                  </div>
                )}
                <div className="meta-row">
                  <span>Total</span>
                  <span data-testid="text-checkout-total">{money(minorToMajor(totalMinor))}</span>
                </div>
              </div>
              {formError && (
                <div className="form-message" data-testid="status-checkout-error">
                  {formError}
                </div>
              )}
              <form onSubmit={submit}>
                <div className="field">
                  <label htmlFor="pay-method">Pay with</label>
                  <select
                    id="pay-method"
                    value={method}
                    onChange={(event) => setMethod(event.target.value)}
                    data-testid="input-pay-method"
                  >
                    {METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                {MOBILE_METHODS.has(method) && (
                  <div className="field">
                    <label htmlFor="pay-phone">Mobile money number</label>
                    <input
                      id="pay-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+255700000000"
                      required
                      data-testid="input-pay-phone"
                    />
                  </div>
                )}
                <div className="field">
                  <label htmlFor="coupon">Coupon code (optional)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      id="coupon"
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value)}
                      placeholder="e.g. KARIBU10"
                      data-testid="input-coupon"
                    />
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={applyCoupon}
                      data-testid="button-apply-coupon"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && <p className="field-error" data-testid="text-coupon-message">{couponMessage}</p>}
                </div>
                <button
                  className="button button-primary auth-submit"
                  type="submit"
                  disabled={pending || !course.id}
                  data-testid="button-pay"
                >
                  {pending ? 'Creating order…' : `Pay ${money(minorToMajor(totalMinor))}`}
                </button>
                {!course.id && (
                  <p className="field-error">
                    This course preview is not linked to the catalog yet — enrollment opens after the next sync.
                  </p>
                )}
              </form>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
