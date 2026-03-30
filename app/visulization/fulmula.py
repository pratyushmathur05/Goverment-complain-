import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

st.title("Advanced Complaint Priority Score Visualizer")

# =========================
# SHOW FORMULA (MATH FORMAT)
# =========================
st.subheader("📘 Priority Formula")

st.latex(r"""
P =
\Big[
\alpha R^{\gamma}
+ \beta V^{\delta}
+ \chi \cdot \frac{\log(1 + D)}{\log(2)}
+ \eta T
+ \lambda Time
+ \mu (V \cdot D)
+ \nu (T \cdot urgency)
\Big]
\times (1 + urgency)
\times e^{-\kappa (1 - V)}
""")

# =========================
# SLIDERS
# =========================
R = st.slider("User Rating (R)", 0.0, 1.0, 0.5)
V = st.slider("AI Validation (V)", 0.0, 1.0, 0.5)
T = st.slider("Complaint Type (T)", 0.0, 1.0, 0.5)
urgency = st.slider("Urgency", 0.0, 1.0, 0.5)

# =========================
# PARAMETERS
# =========================
alpha = 0.15
beta = 0.25
chi = 0.2
eta = 0.15
lambda_ = 0.1
mu = 0.1
nu = 0.05
gamma = 2
delta = 2
kappa = 2

# =========================
# GRID
# =========================
D_vals = np.linspace(0, 1, 50)
Time_vals = np.linspace(0, 1, 50)

D, Time = np.meshgrid(D_vals, Time_vals)

# =========================
# LOG SCALING
# =========================
D_norm = np.log(1 + D) / np.log(2)

# =========================
# COMPLEX FORMULA
# =========================
P_base = (
    alpha * (R ** gamma)
    + beta * (V ** delta)
    + chi * D_norm
    + eta * T
    + lambda_ * Time
    + mu * (V * D)
    + nu * (T * urgency)
)

P = P_base * (1 + urgency) * np.exp(-kappa * (1 - V))

# =========================
# SHOW CURRENT SCORE
# =========================
# Use average D and Time for single score display
D_sample = 0.5
Time_sample = 0.5

D_norm_sample = np.log(1 + D_sample) / np.log(2)

P_sample = (
    alpha * (R ** gamma)
    + beta * (V ** delta)
    + chi * D_norm_sample
    + eta * T
    + lambda_ * Time_sample
    + mu * (V * D_sample)
    + nu * (T * urgency)
)

P_sample = P_sample * (1 + urgency) * np.exp(-kappa * (1 - V))

st.subheader("📊 Current Priority Score")
st.write(f"**P = {P_sample:.4f}**")

# =========================
# 3D SURFACE PLOT
# =========================
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

ax.plot_surface(D, Time, P)

ax.set_xlabel("Density (D)")
ax.set_ylabel("Time")
ax.set_zlabel("Priority (P)")
ax.set_title("Priority Score Surface")

st.pyplot(fig)

# =========================
# SCATTER PLOT
# =========================
D_flat = D.flatten()
P_flat = P.flatten()
Time_flat = Time.flatten()

fig2, ax2 = plt.subplots()

scatter = ax2.scatter(D_flat, P_flat, c=Time_flat)

ax2.set_xlabel("Density (D)")
ax2.set_ylabel("Priority (P)")
ax2.set_title("Scatter Plot (Color = Time)")

plt.colorbar(scatter, ax=ax2)

st.pyplot(fig2)

# =========================
# SHOW CODE VERSION
# =========================
st.subheader("💻 Formula in Code")

st.code("""
P = (
    alpha * (R ** gamma)
    + beta * (V ** delta)
    + chi * (log(1 + D) / log(2))
    + eta * T
    + lambda_ * Time
    + mu * (V * D)
    + nu * (T * urgency)
) * (1 + urgency) * exp(-kappa * (1 - V))
""")