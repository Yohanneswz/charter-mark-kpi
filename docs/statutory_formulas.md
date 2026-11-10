# Mathematical & Statutory Performance Models
### Federal Civil Servants Proclamation No. 1353/2025 (Federal Negarit Gazeta)

---

## 1. Statutory 60/40 Appraisal Split

Section 42 of Proclamation No. 1353/2025 mandates that civil servant performance evaluations replace subjective opinions with an empirical evaluation formula:

$$\text{Total Semester Score (100 pts)} = S_{\text{Objective}} (60\,\text{pts}) + S_{\text{Supervisor}} (40\,\text{pts})$$

---

## 2. Objective Desk Performance Component (60 pts)

The objective score is derived purely from real-time counter timestamps, volume throughput, and verified citizen ratings:

$$S_{\text{Objective}} = S_{\text{Volume}} + S_{\text{SLA}} + S_{\text{Rating}}$$

### A. Volume Efficiency Score (Max 25 pts)
$$\text{Volume Ratio} = \min\left(1.0, \frac{N_{\text{completed}}}{N_{\text{quota}}}\right)$$
$$S_{\text{Volume}} = 25 \times \text{Volume Ratio}$$

### B. SLA Compliance Score (Max 20 pts)
For every completed session $i$, the SLA variance is calculated against the statutory Charter standard:
$$\Delta t_i = t_{\text{actual}, i} - t_{\text{charter}, i}$$
$$\text{Met SLA} = \begin{cases} 1 & \text{if } \Delta t_i \le 0 \\ 0 & \text{if } \Delta t_i > 0 \end{cases}$$
$$\text{Compliance Rate} = \frac{\sum \text{Met SLA}}{N_{\text{completed}}}$$
$$S_{\text{SLA}} = 20 \times \text{Compliance Rate}$$

### C. Verified Citizen Rating Score (Max 15 pts)
$$\text{Mean Rating} = \frac{\sum_{i=1}^{N_{\text{rated}}} R_i}{N_{\text{rated}}} \quad (1.0 \le R_i \le 5.0)$$
$$S_{\text{Rating}} = 15 \times \frac{\text{Mean Rating}}{5.0}$$

---

## 3. Structured Supervisor Component (40 pts)

To eliminate ungrounded favoritism, the 40-point supervisor review is bound to four statutory 10-point dimensions:

$$S_{\text{Supervisor}} = S_{\text{Policy}} (10) + S_{\text{Ethics}} (10) + S_{\text{Attendance}} (10) + S_{\text{ProblemSolving}} (10)$$

* **Policy Alignment (10 pts)**: Strict adherence to ministerial directives and legal mandates.
* **Ethical Integrity (10 pts)**: Clean grievance record, verified by the Anti-Corruption Sentinel.
* **Punctuality & Attendance (10 pts)**: Presence during working hours without unannounced desk abandonment.
* **Problem-Solving & Initiative (10 pts)**: Resolution of complex citizen requests within the legal framework.

---

## 4. Two-Year Cumulative Step Increment Determiner

Under Section 43, civil servants are evaluated biennially across four consecutive semesters ($k = 1, 2, 3, 4$):

$$\bar{S}_{\text{2-Year}} = \frac{1}{4} \sum_{k=1}^{4} S_{\text{Total}, k}$$

### Increment Determination Rules:
$$\text{Decision} = \begin{cases} 
\text{Step Increment (+7.5\% Salary)} & \text{if } \bar{S}_{\text{2-Year}} \ge 80.0\% \\
\text{Remedial Performance Coaching Plan} & \text{if } \bar{S}_{\text{2-Year}} < 80.0\%
\end{cases}$$

$$\text{New Base Salary} = \text{Current Base Salary} \times 1.075$$

---

## 5. Cryptographic Certificate Verification

Every issued two-year appraisal certificate is cryptographically signed using SHA-256 HMAC:

$$\text{Signature} = \text{HMAC-SHA256}(\text{Serial} \parallel \text{EmployeeID} \parallel \bar{S}_{\text{2-Year}} \parallel \text{NewSalary}, K_{\text{CSC}})$$

This prevents administrative document tampering and allows public verification through `/verify`.
