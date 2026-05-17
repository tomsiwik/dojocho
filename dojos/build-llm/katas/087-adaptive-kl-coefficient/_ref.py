"""Reference solution for adaptive-kl-coefficient."""


def update_beta(beta: float, kl: float, target_kl: float, lr: float = 0.5) -> float:
    if kl > 2.0 * target_kl:
        beta = beta * (1.0 + lr)
    elif kl < 0.5 * target_kl:
        beta = beta / (1.0 + lr)
    return float(beta)
