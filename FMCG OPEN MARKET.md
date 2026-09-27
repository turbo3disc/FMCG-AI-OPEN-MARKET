# **FMCG OPEN MARKET PLATFORM**

## **Product Requirements Document (PRD)**

**Product:** AI-Powered FMCG Open Market Platform  
**Working Project Name:** FMCG Open Market Platform  
**Version:** 0.3
**Status:** Working Draft — B2B/B2C alignment applied (dual profiles, canonical catalogue, quote v2, zone coverage, grouped orders)
**Date:** 27 September 2026  
**Initial Market:** Nigeria  
**Proposed Pilot:** Lagos  
**Final Brand Name:** To be determined

### **Product Thesis**

> A location-aware FMCG marketplace where buyers can discover what is genuinely available nearby, compare sellers, interact with them, place orders and pay through protected or delivery-based methods, while AI helps both buyers and sellers close business faster.

---

# **1\. EXECUTIVE SUMMARY**

The FMCG Open Market Platform is an AI-first digital marketplace connecting three buyer groups—**everyday shoppers, households and retail shops**—with two primary seller groups—**wholesalers and distributors**.

The platform is designed to make FMCG commerce more local, transparent and actionable by combining:

* Product discovery  
* Real/near-live inventory  
* Geographic proximity  
* Seller comparison  
* Buyer-seller interaction  
* Orders  
* Quotes  
* Logistics  
* Protected payment workflows  
* Pay-on-delivery  
* AI-assisted commerce

The product will serve both **B2C and B2B commerce**.

A household shopper may search for a carton of beverages or household products and find sellers nearby.

A retail shop may search for bulk quantities, compare wholesalers and distributors, request quotations, negotiate within controlled marketplace tools and reorder frequently.

Sellers will gain:

* Digital storefronts  
* SKU-based catalogues  
* Inventory controls  
* Customer conversations  
* Order management  
* Quote management  
* Sales insights  
* AI assistance for merchandising and sales

The first release should be deliberately narrow:

> **FMCG only, with a limited set of product categories and a defined launch geography.**

The goal is not to digitize every aspect of commerce on day one. The goal is to prove a repeatable transaction loop:

**Discover → Verify Availability → Interact → Order → Deliver/Pick Up → Pay/Settle → Review → Reorder**

---

## **1.1 Product Vision**

Become a trusted digital marketplace for FMCG commerce in Nigeria where buyers can find the right goods from nearby verified sellers, while sellers can reach ready customers and grow distribution through AI-assisted commerce.

---

## **1.2 Core Value Proposition**

### **For Buyers**

* Find FMCG products that are actually available.  
* Find sellers close to their location.  
* Compare prices and available quantities.  
* Find alternative sellers when one seller is out of stock.  
* Chat or call sellers.  
* Request quotations for bulk purchases.  
* Place orders.  
* Select delivery or pickup.  
* Pay online through protected payment arrangements or use pay-on-delivery where eligible.  
* Reorder products easily.

### **For Sellers**

* Reach nearby and wider buyers.  
* Create digital storefronts.  
* Publish SKU-based products.  
* Display prices and stock.  
* Manage inventory.  
* Receive orders and quote requests.  
* Interact directly with buyers.  
* Use AI to create product listings and sales responses.  
* Monitor sales and low-stock products.  
* Build repeat business with retail shops.

### **For the Marketplace**

* Aggregate FMCG demand and supply.  
* Increase transaction frequency.  
* Build trust through verification, protected transaction workflows and dispute management.  
* Monetize completed transactions, seller tools, logistics and advertising.

---

## **1.3 Success Definition for MVP**

The MVP is successful when:

1. A buyer can find an FMCG product, see stock and nearby sellers, and place an order without leaving the platform.  
2. A retail-shop buyer can discover wholesale/distributor supply, communicate, request/accept pricing and place repeat orders.  
3. A seller can onboard, publish SKUs, maintain quantities and fulfill orders with clear transaction status.  
4. The platform can process protected online transactions.  
5. The platform can support pay-on-delivery through approved logistics workflows.  
6. AI materially reduces search effort, listing effort and reorder effort without making uncontrolled commercial decisions for users.

---

# **2\. PRODUCT SCOPE**

## **2.1 In Scope for MVP**

### **Marketplace**

* FMCG-only marketplace  
* Buyer and seller registration  
* Seller verification  
* Product catalogue  
* SKU management  
* Inventory management  
* Search  
* Category browsing  
* Location-aware discovery  
* Nearby seller results  
* Alternative seller discovery  
* Price and stock visibility  
* Seller storefronts  
* Buyer-seller chat  
* Controlled call/contact functionality  
* Cart  
* Checkout  
* Orders  
* Retail-shop RFQ/quotation  
* Reorder  
* Online protected payment  
* Pay-on-delivery  
* Delivery/pickup options  
* Logistics partner integration  
* Proof of delivery  
* Reviews and ratings  
* Dispute management  
* Fraud/risk monitoring  
* Admin dashboard  
* AI search and seller assistance

---

## **2.2 Explicitly Out of Scope for MVP**

The following are not part of the first release:

* Fashion  
* Electronics  
* Autos  
* Real Estate  
* Digital products  
* Marketplace-owned inventory  
* Proprietary wallet  
* Proprietary banking infrastructure  
* Proprietary payment rail  
* Fully owned nationwide delivery fleet  
* Anonymous/unverified selling  
* Complex trade finance  
* Credit lending  
* BNPL  
* Advanced multi-warehouse ERP  
* Nationwide launch from day one

---

## **2.3 Phase 2 / Future Scope**

Potential future features include:

* Multi-seller cart  
* Consolidated checkout  
* Retailer subscriptions  
* Recurring replenishment  
* Automated purchase lists  
* Distributor sales territories  
* Delivery route planning  
* Marketplace advertising  
* Sponsored products  
* Advanced analytics  
* Working-capital partnerships  
* Credit products through appropriate providers  
* Cross-state logistics  
* Nationwide expansion

---

# **3\. PROBLEM STATEMENT**

FMCG commerce in Nigeria is highly distributed.

A buyer may know exactly what product they need but not:

* Who has it?  
* Where is the seller?  
* Is it actually in stock?  
* What quantity is available?  
* What is the current price?  
* Is there a cheaper or closer seller?  
* Can the seller deliver?  
* Can the buyer pay securely?  
* What happens if something goes wrong?

Retail shops face an additional challenge.

They need a reliable way to identify wholesalers and distributors who have the products they require, especially when stock is low or a preferred supplier is unavailable.

Sellers also face challenges.

Many wholesalers and distributors manage product information, stock and customer relationships using fragmented tools such as:

* Phone calls  
* Messaging apps  
* Paper records  
* Spreadsheets  
* Informal customer databases

This makes product discovery difficult and inventory information hard to trust.

### **Product Response**

The FMCG Open Market Platform brings these activities together:

**Product \+ Seller \+ Location \+ Inventory \+ Communication \+ Order \+ Payment \+ Logistics \+ AI**

---

# **4\. USERS & PERSONAS**

## **4.1 Buyer Personas**

### **A. Everyday Shopper**

A consumer looking for everyday FMCG products.

**Needs**

* Convenience  
* Good prices  
* Product availability  
* Nearby sellers  
* Fast delivery

**Typical behaviour**

* Searches individual products  
* Buys small quantities  
* Compares sellers  
* Uses delivery or pickup  
* May reorder frequently

---

### **B. Household Buyer**

A household purchasing groceries and household essentials.

**Needs**

* Routine shopping  
* Reliable products  
* Convenient delivery  
* Repeat shopping  
* Household shopping lists

**Typical behaviour**

* Purchases groceries  
* Purchases cleaning products  
* Purchases beverages  
* Creates repeat baskets  
* Values reliable fulfillment

---

### **C. Retail Shop Buyer**

A retailer purchasing FMCG products for resale.

**Needs**

* Wholesale supply  
* Competitive pricing  
* Available stock  
* Multiple suppliers  
* Minimum order quantities  
* Reliable delivery

**Typical behaviour**

* Buys in bulk  
* Requests quotations  
* Negotiates  
* Compares suppliers  
* Places frequent repeat orders

---

# **4.2 Seller Personas**

## **A. Wholesaler**

A business selling FMCG products in volume.

**Needs**

* More customers  
* Retailer acquisition  
* Inventory visibility  
* Bulk orders  
* Repeat customers

**Typical behaviour**

* Lists many SKUs  
* Sets prices  
* Sets minimum order quantities  
* Handles retailer enquiries  
* Fulfills frequent orders

---

## **B. Distributor**

A company or business distributing products to retailers or other buyers.

**Needs**

* Market reach  
* Distributor network  
* Retailer acquisition  
* Inventory management  
* Geographic coverage  
* Repeat B2B customers

**Typical behaviour**

* Maintains broad product catalogues  
* Manages larger inventory  
* Supports retailer relationships  
* Handles frequent orders  
* Uses logistics partners

---

# **4.3 Operational Users**

### **Marketplace Admin**

Responsible for:

* User governance  
* Seller approvals  
* Product moderation  
* Configuration  
* Dispute oversight  
* Platform policies

### **Support/Dispute Agent**

Responsible for:

* Complaint investigation  
* Evidence collection  
* Customer support  
* Dispute handling  
* Approved resolution execution

### **Finance/Risk Admin**

Responsible for:

* Payment reconciliation  
* Settlement review  
* Refunds  
* Payment exceptions  
* Risk monitoring

### **Logistics Partner/Driver**

Responsible for:

* Pickup  
* Delivery  
* Proof of delivery  
* Payment collection when applicable  
* Delivery exceptions

---

# **5\. PRODUCT EXPERIENCE & CORE JOURNEYS**

# **5.1 Buyer Journey — Shopper / Household**

1. Open marketplace.  
2. Set or confirm location.  
3. Search using:  
   * Product name  
   * Brand  
   * Category  
   * SKU  
   * Natural language  
4. Review nearby sellers.  
5. Compare:  
   * Price  
   * Stock  
   * Quantity  
   * Seller  
   * Distance  
   * Delivery/pickup  
6. Open product or seller page.  
7. Chat or call seller where appropriate.  
8. Add product to cart.  
9. Select:  
   * Delivery  
   * Pickup  
10. Select payment method.  
11. Pay online or choose eligible pay-on-delivery.  
12. Track order.  
13. Receive goods.  
14. Confirm delivery.  
15. Review seller.  
16. Receive reorder suggestions.

---

# **5.2 Buyer Journey — Retail Shop**

Example request:

> “I need 20 cartons of soft drink X within 5 km.”

AI converts the request into a structured requirement:

**Product:** Soft Drink X  
**Quantity:** 20 cartons  
**Maximum distance:** 5 km

The system presents:

* Wholesalers  
* Distributors  
* Stock available  
* Prices  
* MOQ  
* Distance  
* Seller trust information  
* Delivery options

Retailer may:

1. Request a quote.  
2. Chat with seller.  
3. Receive quotation.  
4. Negotiate.  
5. Accept quotation.  
6. Convert quote into order.  
7. Select delivery/pickup.  
8. Select payment method.  
9. Complete order.  
10. Reorder later.

---

# **5.3 Seller Journey**

1. Register.  
2. Submit business and identity information.  
3. Complete seller verification.  
4. Create seller profile.  
5. Enter business location.  
6. Add delivery coverage.  
7. Add products.  
8. Enter SKU.  
9. Enter:  
   * Product name  
   * Brand  
   * Category  
   * Unit  
   * Pack size  
   * Price  
   * Quantity  
10. Upload images.  
11. AI checks listing quality.  
12. Publish product.  
13. Receive:  
* Buyer searches  
* Chats  
* Quote requests  
* Orders  
14. Accept/reject eligible orders.  
15. Fulfill orders.  
16. Update inventory.  
17. Receive settlement.  
18. Monitor sales.  
19. Use AI insights.  
20. Reorder/replenish stock.

---

# **6\. FUNCTIONAL REQUIREMENTS**

## **6.1 Accounts & Onboarding**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| ACC-01 | Users can register with phone/email and secure authentication. | Must |
| ACC-02 | Users select primary account type: Shopper/Household, Retail Shop, Wholesaler or Distributor. A single user can hold both buyer and seller profiles (e.g. retail shop that also sells) with switchable context and separate permissions. | Must |
| ACC-03 | Seller onboarding captures business name, address/location, contact details and required verification documents. | Must |
| ACC-04 | System supports role-based permissions by account type and by active profile context. | Must |
| ACC-05 | Users can manage addresses and preferred delivery locations. | Must |
| ACC-06 | Guest users can browse search, products and storefronts without checkout; checkout requires registered buyer profile. | Must |
| ACC-07 | Seller verification is tiered: Tier 1 (phone + business name, B2C small basket limits), Tier 2 (CAC/business docs + address + bank, full B2C + B2B). B2B bulk / COD eligibility requires Tier 2. | Must |

---

# **6.2 Product Catalogue & SKU**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| CAT-01 | Seller can create an offer using SKU, linked canonical product, product name, brand, category, unit/pack size, price and quantity. | Must |
| CAT-02 | Seller can upload multiple product images. | Must |
| CAT-03 | Seller can pause/unpublish a listing without deleting inventory history. | Must |
| CAT-04 | Inventory quantity decreases when an order is confirmed/allocated and is restored on approved cancellation. | Must |
| CAT-05 | Product variants/pack sizes (piece, pack, carton) are represented as distinct purchasable SKUs linked to a shared canonical product where appropriate to enable alternative-seller matching. | Must |
| CAT-06 | AI can suggest structured product metadata from seller text/images, subject to seller approval. | Should |
| CAT-07 | System records last inventory update time and inventory confidence signal. | Should |
| CAT-08 | Marketplace maintains a canonical product catalogue; seller listings link to a canonical product or enter an admin moderation queue for dedup/mapping. Unmapped listings do not appear in alternative-seller results. | Must |
| CAT-09 | B2B offers support MOQ plus optional bulk price breaks (e.g. 1-9 cartons ₦X, 10+ cartons ₦Y). B2C offers support retail unit price. Both are visible with unit labels. | Must |

---

# **6.3 Search & Discovery**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| SRCH-01 | Users can search products by keyword, brand, SKU and category. Guest browsing supported. | Must |
| SRCH-02 | Users can filter by location/radius/service-zone, price, availability, seller type, seller tier, unit type (retail vs bulk) and minimum quantity. | Must |
| SRCH-03 | Results prioritize relevant nearby in-stock inventory. B2C defaults to small-radius retail; B2B retail-shop defaults to wider wholesale coverage. | Must |
| SRCH-04 | Users can view alternative sellers offering the same canonical product or substitute products. | Must |
| SRCH-05 | Natural-language/AI search interprets conversational needs. | Should |
| SRCH-06 | Search ranking uses relevance, availability, proximity, seller quality and inventory freshness. | Should |

---

# **6.4 Seller Storefronts**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| STR-01 | Every approved seller has a public storefront/profile. | Must |
| STR-02 | Storefront shows seller type, verification tier, service area/zones, catalogue, operating hours and trust indicators. | Must |
| STR-03 | Retail buyers can view wholesale/distributor MOQ, unit types and bulk price breaks. | Must |
| STR-04 | Seller can configure delivery zones, pickup and pay-on-delivery eligibility per zone. | Must |
| STR-05 | Retail-shop buyers can follow/favorite suppliers and build procurement lists from storefronts. | Should |

---

# **6.5 Buyer-Seller Interaction**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| COM-01 | Buyer and seller can chat inside the platform. | Must |
| COM-02 | Buyers can initiate controlled call/contact flows without exposing unnecessary personal data. | Should |
| COM-03 | Chat is linked to seller and order/quote context. | Must |
| COM-04 | AI can summarize conversations into product, quantity, price and delivery terms for confirmation. | Should |
| COM-05 | Platform can log report/block events and suspicious communication patterns. | Should |

---

# **6.6 Orders & Quotes**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| ORD-01 | B2C buyer can add products to cart and place an instant order (no quote required). | Must |
| ORD-02 | Retail-shop buyers can request a quote (RFQ) from a seller with product, quantity, delivery zone and target price. | Must |
| ORD-03 | Seller can respond with versioned quotation: price, quantity, delivery option, scheduled date where applicable, and expiration. Counter-offers by buyer/seller are versioned. | Must |
| ORD-04 | Accepted quote converts into an order with PO reference, invoice, and an auditable record of agreed terms. Partial acceptance splits into order + residual RFQ where applicable. | Must |
| ORD-05 | Order lifecycle status (pending → confirmed → preparing → out_for_delivery → delivered → completed / cancelled / disputed) is visible to buyer, seller, operations and logistics as appropriate, separate from payment state. | Must |
| ORD-06 | Order history supports one-click reorder with editable quantities; retail shops support reorder from procurement lists. | Must |
| ORD-07 | MVP cart is single-seller per checkout; multi-seller baskets split into separate seller orders grouped under one payment session and buyer order group. | Must |

---

# **6.7 Cart & Checkout (B2C instant + B2B quote-to-order)**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| CART-01 | Cart validates MOQ, available stock, unit type and delivery-zone eligibility before checkout. | Must |
| CART-02 | Checkout shows item price, bulk discounts, delivery fee estimate, payment method, and protection/COD terms before confirm. | Must |
| CART-03 | B2B checkout supports delivery scheduling (date/time window) and PO/invoice note. | Must |

# **6.8 Logistics & Proof of Delivery**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| LOG-01 | Orders support seller delivery, buyer pickup, marketplace logistics partner, and seller-attached logistics. | Must |
| LOG-02 | Delivery jobs support assign/accept, pickup confirm, status updates, OTP, timestamp, location, optional photo/signature, and exception reporting. | Must |
| LOG-03 | COD orders require approved logistics participant, collection record and reconciliation against order. COD capped by policy and buyer history in MVP. | Must |

# **6.9 Reviews, Notifications & Reorder**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| REV-01 | Buyers can rate sellers/orders post-completion; FMCG-specific reasons (expired, damaged, wrong item) supported. | Must |
| NOT-01 | Transaction notifications (order, payment, delivery, dispute) via SMS/email/push/WhatsApp where appropriate. | Must |

# **6.10 Location Zones (B2C proximity + B2B coverage)**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| LOC-01 | Sellers define delivery zones (polygon/radius + fee + min order) in addition to store location. B2C ranking uses proximity; B2B uses zone coverage + stock depth. | Must |

---

# **7\. PAYMENTS, PROTECTED SETTLEMENT & PAY-ON-DELIVERY**

The platform should support multiple payment paths while keeping the marketplace transaction ledger authoritative.

The actual movement or holding of customer funds should be implemented through an appropriately licensed payment provider and reviewed with Nigerian legal/compliance advisers before launch.

---

## **7.1 Payment Option A — Protected Online Payment**

Flow:

**Buyer pays online**

↓

**Payment Provider**

↓

**Transaction protected/pending fulfillment**

↓

**Seller fulfills**

↓

**Delivery completed**

↓

**Buyer confirms / eligible completion event**

↓

**Provider settles seller**

The marketplace records transaction status and reconciliation information.

Where supported by the payment arrangement, an open dispute can pause or divert settlement according to the provider's capabilities and the marketplace policy.

---

# **7.2 Payment Option B — Direct / Immediate Payment**

The platform may support immediate payment methods where appropriate.

The product must clearly distinguish this path from protected/escrow-style transactions.

The customer must understand:

* How payment is made  
* Whether marketplace protection applies  
* What happens after payment  
* Refund conditions  
* Dispute conditions

---

# **7.3 Payment Option C — Pay on Delivery**

Pay-on-delivery allows an approved logistics partner or seller-designated delivery agent to collect payment when goods arrive.

Flow:

**Buyer places order**

↓

**Seller confirms**

↓

**Logistics partner assigned**

↓

**Seller prepares goods**

↓

**Logistics picks up goods**

↓

**Goods delivered**

↓

**Buyer receives/inspects according to policy**

↓

**Buyer provides delivery OTP**

↓

**Payment collected**

↓

**Proof of delivery submitted**

↓

**Payment reconciled**

↓

**Seller settlement**

Payment collection may support approved methods such as:

* Cash  
* POS  
* Bank transfer  
* Payment link  
* QR

The operating policy must determine which methods are available.

---

# **7.4 Payment Controls**

The platform must:

* Never treat a database field as proof that money moved.  
* Use PSP webhooks and reconciliation.  
* Implement idempotency.  
* Maintain immutable payment records.  
* Require role-based authorization for refunds.  
* Require role-based authorization for manual settlement adjustments.  
* Clearly disclose product price.  
* Clearly disclose delivery charges.  
* Clearly disclose payment method.  
* Clearly disclose important commercial conditions.

---

## **Payment State Machine**

| Payment State | Meaning | Applies To |
| ----- | ----- | ----- |
| PENDING | Order created; payment not yet confirmed | B2C + B2B |
| PROTECTED | Online payment confirmed and controlled through the payment arrangement pending fulfillment | B2C + B2B |
| OUT\_FOR\_DELIVERY | Order entered delivery workflow | B2C + B2B |
| DELIVERED\_PENDING\_CONFIRMATION | Delivery evidence submitted; confirmation or policy timer applies | B2C + B2B |
| SETTLEMENT\_PENDING | Eligible for seller settlement (split per seller in grouped orders) | B2C + B2B |
| SETTLED | Seller settlement completed | B2C + B2B |
| DISPUTED | Buyer/seller dispute opened | B2C + B2B |
| REFUNDED | Buyer refund completed | B2C + B2B |
| COD\_PENDING\_COLLECTION | COD order delivered; collection pending reconciliation | B2B + B2C COD |
| COD\_RECONCILED | COD cash/POS/transfer confirmed against order | B2B + B2C COD |

B2C defaults to protected online payment or low-value COD under policy cap. B2B supports higher-value bank-transfer / payment-link COD with Tier-2 verification, per-seller settlement split, and invoice/PO references.

## **Order Lifecycle State Machine (separate from payment)**

`pending → confirmed → preparing → out_for_delivery → delivered → completed` with side branches `cancelled`, `disputed`, `refunded`. Payment state transitions independently and is reconciled via PSP webhooks; never infer money movement from order status alone.

---

# **8\. LOGISTICS & FULFILLMENT**

## **8.1 Fulfillment Modes**

| Mode | Description | MVP |
| ----- | ----- | ----- |
| Seller Delivery | Seller uses own delivery staff/vehicle. | Yes |
| Buyer Pickup | Buyer collects from seller. | Yes |
| Marketplace Logistics Partner | Platform matches order with an approved logistics company/driver. | Yes |
| Seller-Attached Logistics | Seller/distributor has preferred logistics partner(s) attached to the business. | Yes |

---

# **8.2 Logistics Partner Features**

The platform should support:

* Logistics partner onboarding  
* Partner verification  
* Driver onboarding  
* Delivery job assignment  
* Job acceptance/rejection  
* Pickup confirmation  
* Delivery status updates  
* Controlled buyer contact  
* OTP verification  
* Timestamp  
* Delivery location  
* Optional photo  
* Optional signature  
* Payment collection confirmation  
* Delivery failure reporting  
* Customer unavailable reporting  
* Damaged package reporting  
* Wrong-item reporting  
* Payment mismatch reporting

---

# **9\. TRUST, SAFETY, FRAUD & DISPUTES**

## **9.1 Seller Verification**

Seller onboarding should support verification appropriate to:

* Seller type  
* Transaction risk  
* Business status  
* Operating scope

The platform must distinguish between:

**Identity/Business Verification**

and

**Product Authenticity**

Verification of a seller must not automatically be represented as a guarantee that every product they sell is authentic or compliant.

---

# **9.2 Dispute Workflow**

### **Step 1 — Dispute Opened**

Buyer or seller creates a dispute.

### **Step 2 — Reason Captured**

Examples:

* Wrong product  
* Missing quantity  
* Damaged product  
* Payment issue  
* Delivery issue  
* Product quality concern  
* Suspected fraudulent transaction

### **Step 3 — Evidence Collection**

System requests relevant evidence:

* Order details  
* Product listing  
* Chat messages  
* Delivery records  
* Photos  
* Payment records  
* OTP  
* Proof of delivery

### **Step 4 — Settlement Protection**

Where applicable, settlement is paused according to the payment arrangement and policy.

### **Step 5 — Investigation**

Support/Dispute Agent reviews the available evidence.

### **Step 6 — Resolution**

An authorized person records one of the approved outcomes:

* Release funds  
* Refund buyer  
* Partial settlement  
* Further investigation

### **Step 7 — Notification**

Buyer and seller receive the resolution.

### **Step 8 — Audit**

Every decision is logged.

---

# **9.3 Fraud/Risk Signals**

The system can monitor for:

* Repeated failed deliveries  
* Repeated COD non-acceptance  
* Multiple accounts linked to suspicious patterns  
* Repeated disputes  
* Abnormal refund behaviour  
* Inventory manipulation  
* Suspicious stock changes  
* Suspicious payment patterns  
* Attempts to move transactions off-platform  
* Payment webhook mismatch  
* Order ledger mismatch  
* Settlement mismatch

AI-based risk signals should be **advisory**.

A risk score should trigger:

* Review  
* Additional verification  
* Operational controls

rather than automatically accusing a user of fraud without a defined rule and human/operational review.

---

# **10\. AI COMMERCE LAYER**

## **AI Principle**

> AI should reduce friction and increase clarity while users remain in control of commercial decisions.

Important actions such as:

* Price changes  
* Order confirmation  
* Refunds  
* Settlement  
* Account restrictions

must require explicit action by the user or an authorized administrator.

---

# **10.1 AI Features for Buyers**

### **AI Conversational Search**

Example:

> “Find 10 cartons of bottled water under ₦X within 5 km.”

AI converts the request into searchable parameters.

### **Smart Product Matching**

AI identifies relevant FMCG products even when the buyer uses informal language.

Example:

> “I need baby food for a 1-year-old.”

The platform can return matching products based on marketplace data, while avoiding unsupported medical or nutritional claims.

### **Alternative Seller Discovery**

If one seller is out of stock:

> “This seller is out of stock. 6 nearby sellers have matching products.”

### **Basket Assistance**

AI can suggest:

* Complementary FMCG products  
* Frequently purchased products  
* Replenishment items

### **Reorder Assistant**

Example:

> “Reorder my usual shop supplies.”

AI uses purchase history to prepare a reorder list for user confirmation.

---

# **10.2 AI Features for Sellers**

## **Listing Copilot**

Generate:

* Product title  
* Product description  
* Tags  
* Standardized product fields

from seller input and uploaded images.

Seller must approve before publication.

---

## **Catalogue Normalizer**

Convert inconsistent seller product names into standardized marketplace categories.

Example:

> “Detergent 1kg Big Size”

could be mapped into an appropriate marketplace taxonomy.

---

## **Sales Copilot**

Provide seller summaries such as:

* Top products  
* Low-stock products  
* Sales trends  
* Customer questions  
* Best-selling SKUs

---

## **Replenishment Assistant**

Suggest potential reorder quantities based on:

* Historical sales  
* Current stock  
* Reserved stock  
* Sales velocity

These should be recommendations rather than automatic purchasing decisions in MVP.

---

## **Conversation Copilot**

AI can:

* Summarize customer requirements  
* Draft seller replies  
* Identify requested quantity  
* Identify requested price  
* Identify requested delivery terms

Seller reviews before sending.

---

## **Promotion Assistant**

AI can suggest:

* Promotional copy  
* Product bundles  
* Campaign ideas  
* Product highlights

Seller approves publication.

---

# **10.3 AI Data & Governance**

AI outputs must:

* Show confidence or limitations where useful.  
* Allow correction.  
* Avoid unnecessary exposure of personal information.  
* Require human confirmation for high-impact actions.  
* Maintain logs for important AI interactions.  
* Be evaluated against actual marketplace outcomes.  
* Allow users to correct AI-generated information.

---

# **11\. LOCATION-AWARE MARKETPLACE**

Location is one of the core mechanics of the platform.

The platform should help a buyer answer:

> **“Who has what I need, how much do they have, and how close are they?”**

## **Location Features**

* Buyer-selected location  
* Optional device location  
* Seller location  
* Store/warehouse location  
* Radius search (B2C default: 3-5 km)  
* Seller delivery zones with fee + min-order per zone (B2B default: city-wide coverage)  
* Nearby seller ranking (B2C) and zone-coverage + stock-depth ranking (B2B)  
* Delivery coverage  
* Pickup availability  
* Scheduled delivery windows for B2B bulk  
* Alternative seller recommendations  
* Inventory freshness indicator

### **Example Search**

Customer enters:

> “Indomie carton”

Platform shows:

| Seller | Distance | Stock | Price |
| ----- | ----- | ----- | ----- |
| Seller A | 1.5 km | 40 cartons | ₦X |
| Seller B | 3.2 km | 18 cartons | ₦X |
| Seller C | 4.8 km | 75 cartons | ₦X |

---

# **12\. INVENTORY MANAGEMENT**

Inventory accuracy is one of the platform's core trust signals.

The MVP should use a simple but auditable inventory model.

---

## **12.1 Inventory Fields**

| Field | Purpose |
| ----- | ----- |
| SKU | Seller-defined or marketplace-recognized product identifier |
| On Hand | Physical quantity seller reports |
| Reserved | Quantity allocated to active orders |
| Available | On Hand minus Reserved |
| Unit/Pack Size | Defines sellable unit |
| MOQ | Minimum Order Quantity |
| Last Updated | Shows inventory freshness |

---

## **12.2 Inventory Rules**

The platform should:

* Prevent overselling.  
* Reserve inventory when orders are confirmed.  
* Release reserved inventory on approved cancellation.  
* Create an audit event for every inventory adjustment.  
* Allow sellers to manually update stock.  
* Capture reasons for high-risk stock adjustments.  
* Display inventory freshness where important.

---

# **13\. ADMIN & OPERATIONS CONSOLE**

The platform needs a central Super Admin/Operations console.

## **Admin Modules**

### **Users**

* Search  
* View  
* Verify  
* Suspend  
* Assign roles  
* Review activity

### **Sellers**

* Review onboarding  
* Approve/reject  
* Verify business  
* Monitor performance  
* Review catalogue

### **Products**

* Manage taxonomy  
* Moderate products  
* Detect duplicate listings  
* Control prohibited items

### **Orders**

* Search  
* View  
* Monitor  
* Intervene where authorized  
* Handle exceptions

### **Payments**

* View payment events  
* Reconcile transactions  
* Review refunds  
* Review settlements  
* Investigate mismatches

### **Disputes**

* Queue  
* Evidence  
* SLA  
* Resolution  
* Appeal records

### **Logistics**

* Partner management  
* Driver management  
* Delivery jobs  
* COD reconciliation  
* Delivery exceptions

### **AI**

* Model configuration  
* Prompt/version management  
* AI quality monitoring  
* Feedback  
* AI audit logs

### **Analytics**

* GMV  
* Orders  
* Buyers  
* Sellers  
* Conversion  
* Inventory  
* Disputes  
* Logistics  
* AI usage

---

# **14\. CORE DATA MODEL**

The initial database should include the following major entities:

### **User**

* id  
* role  
* phone  
* email  
* status  
* consent/privacy settings

### **Business/Seller**

* id  
* seller type  
* legal/business name  
* business information  
* locations  
* verification status

### **Buyer Profile**

* id  
* buyer type  
* address  
* preferences

### **Product**

* id  
* taxonomy  
* brand  
* canonical name  
* images  
* attributes  
* canonical status (canonical / pending-mapping / rejected-duplicate)

### **Seller SKU (Offer)**

* id  
* seller\_id  
* product\_id (canonical link, nullable pending moderation)  
* sku  
* unit types (piece / pack / carton with conversion)  
* price + bulk price breaks  
* stock (on\_hand, reserved, available)  
* MOQ  
* delivery zones  
* availability

### **Location**

* id  
* address/area  
* coordinates/geospatial representation  
* service radius (B2C)  
* delivery zones (polygon/radius + fee + min order + schedule windows, B2B)

### **Cart**

* buyer\_id  
* seller\_id (single-seller per cart in MVP)  
* cart lines (sku, unit type, qty, MOQ check)  
* totals (items, bulk discount, delivery estimate)

### **Order Group (multi-seller basket)**

* buyer\_id  
* payment session reference  
* child order ids (one per seller)

### **Quote/RFQ**

* buyer\_id  
* seller\_id  
* requested products (with unit type + target price)  
* seller response versions (price, qty, delivery, expiry)  
* counter-offer history  
* validity  
* po\_reference on accept

### **Order**

* buyer  
* seller  
* items  
* price  
* delivery mode  
* payment state  
* lifecycle status

### **Payment Transaction**

* order\_id  
* provider reference  
* status  
* amount  
* currency  
* payment events

### **Settlement**

* seller\_id  
* order/transaction references  
* amount  
* status  
* reconciliation references

### **Delivery Job**

* order\_id  
* partner/driver  
* status  
* OTP  
* proof of delivery

### **Conversation**

* buyer  
* seller  
* order/quote context  
* messages  
* moderation state

### **Dispute**

* order\_id  
* reason  
* evidence  
* status  
* resolution

### **Review**

* order\_id  
* buyer/seller  
* rating  
* text  
* moderation state

### **Audit Event**

* actor  
* action  
* entity  
* timestamp  
* before/after or event payload

---

# **15\. TECHNICAL ARCHITECTURE — AI-ASSISTED BUILD**

The platform should be designed as a modular **web \+ mobile system** with an API-first backend.

A practical AI-assisted build can use a mainstream TypeScript ecosystem.

---

## **15.1 Suggested Technology Stack**

| Layer | Suggested Starting Approach | Notes |
| ----- | ----- | ----- |
| Web | Next.js / React | Buyer marketplace, seller portal and admin |
| Mobile | React Native / Expo | Buyer and logistics experiences |
| Backend | Node.js \+ TypeScript | REST APIs, webhooks and business logic |
| Database | PostgreSQL | Core transactional data |
| Search | PostgreSQL full-text initially | Dedicated search later |
| Location | PostGIS | Geographic search |
| Cache/Queues | Redis \+ managed queue | Async processing |
| Storage | S3-compatible storage | Product/POD images |
| AI | LLM \+ embeddings \+ retrieval layer | Search and seller copilot |
| Payments | Licensed Nigerian PSP | Checkout, webhooks, settlement |
| Notifications | SMS/email/push/WhatsApp where appropriate | Transaction notifications |

---

# **15.2 AI Development Workflow**

AI should be used to accelerate development, not replace engineering controls.

Use AI coding tools to help generate:

* Project scaffolding  
* API contracts  
* Database migrations  
* Tests  
* UI components  
* Documentation  
* Validation schemas  
* Repetitive business logic

Critical rules must remain in:

* Version-controlled code  
* Automated tests  
* Database constraints  
* Authorization policies

Do not rely on prompts as the only protection for payment, inventory or settlement logic.

Every major feature should include:

* Unit tests  
* Integration tests  
* Error handling  
* Staging validation  
* Pull-request review

---

# **16\. SECURITY, PRIVACY & RELIABILITY**

The platform should treat security as a core product capability.

## **Authentication**

* Secure authentication  
* Session management  
* Password/passwordless options  
* MFA for privileged users

## **Authorization**

* Role-based access control  
* Least-privilege permissions

## **Payments**

* Do not store card information unnecessarily.  
* Use secure payment-provider integrations.

## **Privacy**

* Collect only necessary personal information.  
* Provide clear privacy notices.  
* Give users appropriate controls.

## **Audit**

Create immutable records for:

* Payment changes  
* Settlement actions  
* Dispute decisions  
* Inventory changes  
* Admin actions  
* User status changes

## **Abuse Prevention**

* Rate limits  
* Bot controls  
* Account/device risk signals  
* Content moderation

## **Reliability**

* Idempotent payment operations  
* Retry-safe webhooks  
* Transactional order operations

## **Backup**

* Automated backups  
* Restoration testing

## **Monitoring**

Monitor:

* Application health  
* Payment system  
* Queues  
* Search  
* AI  
* Notifications  
* Logistics

For Nigeria, privacy/compliance planning should account for the **Nigeria Data Protection Act 2023** and the Nigeria Data Protection Commission.

---

# **17\. PRODUCT METRICS & KPIs**

| Metric | Definition | MVP Purpose |
| ----- | ----- | ----- |
| Monthly Active Buyers | Unique buyers active monthly | Adoption |
| Active Sellers | Sellers with active listings/transactions | Supply depth |
| Search-to-View Rate | Search sessions resulting in product views | Discovery quality |
| View-to-Order Rate | Product views resulting in orders | Conversion |
| Order Completion Rate | Orders successfully completed | Transaction health |
| Inventory Freshness Rate | Listings updated within defined timeframe | Availability trust |
| Nearby Match Rate | Searches with viable nearby in-stock sellers | Location value |
| Repeat Purchase Rate | Buyers placing another order | Retention |
| Seller Response Time | Time to respond to buyer | Interaction quality |
| Dispute Rate | Orders resulting in disputes | Trust/risk |
| COD Reconciliation Rate | COD orders reconciled within SLA | Payment/logistics control |
| AI Assisted Action Rate | Completed actions where AI materially helped | AI adoption |

---

# **18\. MVP FEATURE BACKLOG**

| Epic | Must-Have Items | Priority |
| ----- | ----- | ----- |
| Identity | Registration, login, buyer/seller dual-profile, Tier-1/Tier-2 verification, guest browse | P0 |
| Marketplace | FMCG categories, canonical catalogue + dedup queue, search, listings, product pages | P0 |
| Inventory | SKU/offer, unit types, bulk breaks, stock, reservation/release | P0 |
| Location | Location selection, radius + delivery zones, B2C proximity / B2B coverage ranking | P0 |
| Seller | Storefront, product upload, bulk pricing, inventory/order dashboard | P0 |
| Buyer B2C | Cart, instant checkout, orders, reorder history | P0 |
| Buyer B2B | Procurement lists, RFQ versioning/counter-offer, PO/invoice, scheduled delivery, supplier follow | P0 |
| Communication | Chat, order/quote-linked conversation, contact/call | P0 |
| Quotes | Retail RFQ/quote v2 (versioned, expirable, convertible, partial accept) | P0 |
| Payments | PSP checkout, protected + COD states, webhooks, refunds, per-seller settlement split | P0 |
| COD | Logistics assignment, collection, POD/OTP, reconciliation with cap + history rules | P0 |
| Trust | Reviews (FMCG reasons), reports, disputes, admin resolution | P0 |
| AI | Conversational search, listing copilot | P1 |
| Admin | Operations dashboard and audit trail | P0 |

---

# **19\. MVP ACCEPTANCE CRITERIA**

The MVP is considered operational when:

### **Buyer Search**

A household/shoppers account can search an FMCG product and receive relevant nearby sellers with:

* Price  
* Stock  
* Location  
* Seller information

### **Retail Procurement**

A retail-shop account can:

* Search bulk quantity  
* Request a quote  
* Receive a seller quotation  
* Accept seller terms  
* Create an order

### **Seller Listing**

An approved seller can:

* Create a SKU  
* Add product  
* Set price  
* Set quantity  
* Upload image  
* Publish listing

### **Inventory**

When an order reserves stock:

* Available quantity decreases correctly.  
* Overselling is prevented.

### **Checkout**

Buyer can:

* Select delivery/pickup  
* See all material charges  
* Select a payment method  
* Confirm order

### **Online Payment**

A successful payment must create a provider-confirmed transaction state using webhook/reconciliation logic.

### **Pay on Delivery**

A COD order can:

* Be assigned to an approved logistics participant  
* Be delivered  
* Record proof of delivery  
* Record collection  
* Reconcile with the order

### **Dispute**

A dispute can:

* Be opened  
* Capture reason  
* Attach evidence  
* Preserve relevant payment/settlement state  
* Be reviewed  
* Record an authorized resolution

### **AI Listing**

AI-generated product information can be:

* Reviewed  
* Edited  
* Approved  
* Published by seller

### **Audit**

Every important admin action affecting:

* Payment  
* Settlement  
* Dispute  
* Inventory  
* User status

must be auditable.

---

# **20\. DELIVERY ROADMAP**

## **Phase 0 — Product Discovery**

Focus:

* Validate FMCG workflows  
* Interview buyers  
* Interview sellers  
* Define pilot categories  
* Define policies  
* Define seller onboarding

Outputs:

* User interviews  
* Category taxonomy  
* Seller rules  
* Payment policy  
* Logistics policy  
* Clickable user flows

---

## **Phase 1 — Platform Foundation**

Build:

* Authentication  
* Roles  
* Buyer profiles  
* Seller profiles  
* Catalogue  
* SKU  
* Database  
* Admin  
* Location search

---

## **Phase 2 — Transactions**

Build:

* Cart  
* Checkout  
* Payment integration  
* Order state machine  
* Payment webhooks  
* Refunds  
* Settlement tracking

---

## **Phase 3 — Logistics \+ Trust**

Build:

* Logistics partners  
* Driver workflow  
* Delivery jobs  
* Proof of delivery  
* OTP  
* COD  
* Reconciliation  
* Reviews  
* Disputes

---

## **Phase 4 — AI**

Build:

* Conversational search  
* AI product matching  
* Listing copilot  
* Alternative seller AI  
* Reorder assistant  
* Seller sales copilot  
* Recommendations

---

## **Phase 5 — Lagos Pilot**

Launch with:

* Focused geography  
* Concentrated seller cohort  
* Selected FMCG categories

Measure:

* Search success  
* Orders  
* Delivery success  
* Inventory accuracy  
* Repeat orders  
* Seller activity  
* Disputes  
* AI usage

---

## **Phase 6 — Scale**

Expand:

* More Lagos locations  
* More sellers  
* More logistics partners  
* Additional FMCG categories  
* Other Nigerian cities  
* Nationwide coverage

---

# **21\. COMMERCIAL MODEL — INITIAL HYPOTHESES**

Potential revenue streams:

### **Transaction Commission**

A percentage of completed marketplace transactions.

### **Seller Subscription**

Advanced seller tools could use subscription tiers.

Potential paid features:

* More listings  
* Analytics  
* AI seller assistant  
* Higher marketplace visibility

### **Sponsored Products**

Sellers can pay for promoted products.

### **Advertising**

Brands and FMCG businesses can advertise.

### **Logistics Service Fee**

The marketplace may charge a service/margin component where marketplace logistics are used.

### **Premium B2B Procurement**

Large retail accounts may eventually receive:

* Procurement tools  
* Purchase analytics  
* Reorder tools  
* Account features

Fees and commission percentages should be validated through the pilot rather than hard-coded prematurely.

---

# **22\. KEY RISKS & MITIGATIONS**

| Risk | Why It Matters | Mitigation |
| ----- | ----- | ----- |
| Marketplace Cold Start | Buyers need supply; sellers need demand. | Launch with concentrated seller cohort and focused geography. |
| Inventory Inaccuracy | Poor stock data damages trust. | Freshness indicators, seller stock confirmation, reservation and audit trail. |
| Off-Platform Leakage | Buyer and seller may transact outside the platform. | Strong in-platform chat/order/quote experience and transaction protection benefits. |
| COD Fraud | Failed COD orders create delivery costs. | Eligibility rules, history-based controls, delivery confirmation and reconciliation. |
| Payment Disputes | Financial and reputational exposure. | Licensed PSP, clear terms, transaction ledger and dispute SOP. |
| Product Quality | FMCG may include expired, unsafe or misleading products. | Seller verification, reporting workflow and escalation. |
| AI Errors | Incorrect AI information can mislead users. | Human approval, constrained fields and monitoring. |
| Regulatory Change | Rules can change. | Periodic legal/compliance reviews. |

---

# **23\. NIGERIA REGULATORY & COMPLIANCE WORKSTREAM**

**This section is a product-planning checklist, not legal advice.**

Before production launch, the company should obtain Nigeria-specific professional advice regarding:

* Payment services  
* Consumer protection  
* Data processing  
* Privacy  
* Tax  
* Logistics/courier requirements  
* Advertising  
* FMCG/product requirements

### **Consumer Protection**

Marketplace terms should clearly address:

* Pricing  
* Product information  
* Refunds  
* Returns  
* Complaints  
* Delivery  
* Payment  
* Seller obligations

FCCPC publishes guidance relating to e-commerce, consumer rights and complaint handling.

### **Product Information**

The catalogue should support accurate:

* Product name  
* Description  
* Quantity  
* Pack size  
* Brand  
* Seller information

The platform should also have procedures for addressing:

* Unsafe listings  
* Misleading listings  
* Expired products  
* Non-compliant products

### **Data Protection**

Personal data processing should account for the:

**Nigeria Data Protection Act 2023**

and applicable NDPC requirements.

### **Payments**

Use appropriately licensed payment providers.

Obtain professional advice on:

* Protected payment structures  
* Settlement  
* Refunds  
* Chargebacks  
* Payment collection  
* Marketplace obligations

### **Logistics**

Verify applicable authorization/licensing requirements for logistics partners and independent delivery operators before onboarding them.

---

# **24\. OPEN PRODUCT DECISIONS**

| Decision | Current Working Position | Owner |
| ----- | ----- | ----- |
| Product Name | Undecided | Founder/Product |
| Pilot Geography | Lagos | Founder/Product |
| Initial FMCG Categories | Groceries \+ household essentials | Product |
| Payment Provider | Select after capability/compliance review | Product/Finance/Legal |
| Protected Payment Structure | Provider-supported marketplace settlement arrangement | Finance/Legal |
| COD Eligibility | Risk-based, not automatically available to everyone | Risk/Operations |
| Retail Quote Negotiation | In-platform RFQ/quote | Product |
| Logistics | Partner-first; seller-attached logistics supported | Operations |
| AI Model/Vendor | Benchmark for cost, quality, privacy and deployment | Technology |
| Seller Fees | Validate through pilot | Commercial |

---

# **25\. GLOSSARY**

**FMCG:** Fast-moving consumer goods such as groceries, beverages, personal care and household products.

**SKU:** Stock Keeping Unit used to identify a sellable product/pack configuration.

**B2C:** Business-to-consumer.

**B2B:** Business-to-business.

**Protected Payment:** Marketplace transaction where payment is handled through an appropriate payment arrangement with settlement linked to fulfillment/order rules.

**COD:** Payment on Delivery.

**RFQ:** Request for Quotation.

**PSP:** Payment Service Provider.

**POD:** Proof of Delivery.

**MOQ:** Minimum Order Quantity.

**GMV:** Gross Merchandise Value.

---

# **26\. IMMEDIATE PROJECT START PLAN**

## **Step 1 — Lock Product Thesis**

Confirm:

> FMCG marketplace connecting shoppers, households and retail shops with wholesalers and distributors.

## **Step 2 — Define First Product Cluster**

Start with:

* Groceries  
* Beverages  
* Household essentials

Additional categories can be introduced after pilot validation.

## **Step 3 — Conduct User Research**

Interview:

* 10–20 retail shops  
* 10+ wholesalers/distributors  
* Household shoppers

Questions should validate:

* Current buying method  
* Current selling method  
* Inventory problems  
* Delivery problems  
* Payment preferences  
* COD behaviour  
* Product discovery  
* Pricing  
* Trust  
* Willingness to pay marketplace fees

## **Step 4 — Create User Flows**

Design:

1. Shopper flow  
2. Household flow  
3. Retail procurement flow  
4. Wholesaler flow  
5. Distributor flow  
6. Logistics flow  
7. Admin/dispute flow

## **Step 5 — Create Database Model**

Design the relationships between:

* Users  
* Sellers  
* Products  
* SKUs  
* Inventory  
* Locations  
* Quotes  
* Orders  
* Payments  
* Settlements  
* Deliveries  
* Disputes  
* Reviews  
* AI interactions

## **Step 6 — Create API Contracts**

Define:

* Authentication APIs  
* Product APIs  
* Seller APIs  
* Search APIs  
* Location APIs  
* Cart APIs  
* Quote APIs  
* Order APIs  
* Payment APIs  
* Logistics APIs  
* Dispute APIs  
* AI APIs  
* Admin APIs

## **Step 7 — Create Wireframes**

Design:

### **Buyer**

* Splash  
* Signup  
* Home  
* Search  
* Categories  
* Product  
* Seller  
* Cart  
* Checkout  
* Payment  
* Order tracking  
* Chat  
* Reviews  
* Reorder

### **Retail Shop**

* Procurement dashboard  
* Search  
* RFQ  
* Quotes  
* Supplier comparison  
* Orders  
* Reorder

### **Seller**

* Dashboard  
* Products  
* Add SKU  
* Inventory  
* Orders  
* Quotes  
* Customers  
* Messages  
* AI assistant  
* Analytics

### **Logistics**

* Jobs  
* Pickup  
* Delivery  
* OTP  
* POD  
* COD collection  
* Earnings/activity

### **Admin**

* Dashboard  
* Users  
* Sellers  
* Products  
* Orders  
* Payments  
* Logistics  
* Disputes  
* Fraud/risk  
* AI  
* Reports

## **Step 8 — Select Integration Strategy**

Evaluate:

* Payment provider  
* Logistics partner(s)  
* SMS  
* Email  
* Maps/geolocation  
* AI model provider  
* Cloud infrastructure

## **Step 9 — Build AI-Assisted MVP**

Use AI coding tools to accelerate:

* UI development  
* Backend scaffolding  
* Database schema  
* API development  
* Tests  
* Documentation  
* AI integration

## **Step 10 — Run Lagos Pilot**

Start with:

* Focused geographic area  
* Selected FMCG categories  
* Verified wholesalers/distributors  
* Limited logistics partners  
* Controlled buyer cohort

Then measure and iterate.

---

# **APPENDIX A — OFFICIAL SOURCES FOR IMPLEMENTATION REVIEW**

**FCCPC — Business Guidance on E-Commerce**  
[https://fccpc.gov.ng/business-guidance-on-e-commerce-2/](https://fccpc.gov.ng/business-guidance-on-e-commerce-2/)

**FCCPC — Consumer Rights & Responsibilities**  
[https://fccpc.gov.ng/consumers/consumer-rights-responsibilities/rights-responsibilities/](https://fccpc.gov.ng/consumers/consumer-rights-responsibilities/rights-responsibilities/)

**FCCPC — Consumer Complaint Handling**  
[https://fccpc.gov.ng/consumers/complaint-handling/](https://fccpc.gov.ng/consumers/complaint-handling/)

**FCCPC — Mandatory Labelling of Manufactured Goods for Consumer Information**  
[https://fccpc.gov.ng/mandatory-labelling-of-manufactured-goods-for-consumer-information/](https://fccpc.gov.ng/mandatory-labelling-of-manufactured-goods-for-consumer-information/)

**NDPC — Nigeria Data Protection Act 2023**  
[https://www.ndpc.gov.ng/ndp-act-2023/](https://www.ndpc.gov.ng/ndp-act-2023/)

**CBN — Payments System Resources**  
[https://www.cbn.gov.ng/PaymentsSystem/](https://www.cbn.gov.ng/PaymentsSystem/)

Regulatory applicability should be confirmed with qualified Nigerian counsel and the selected payment and logistics providers before production launch.

---

# **PROJECT NORTH STAR**

> **Make it dramatically easier for a buyer to answer: “Where can I get this FMCG product near me right now?” and for a seller to answer: “Which ready buyers can I reliably serve?” — then use AI to shorten the distance between the question and a completed transaction.**

## **END OF PRD**

