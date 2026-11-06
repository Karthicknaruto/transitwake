import json
import os
import random

def run_simulation_v2():
    personas_path = os.path.join('founder', 'panel', 'personas.json')
    answers_dir = os.path.join('founder', 'panel', 'answers')
    os.makedirs(answers_dir, exist_ok=True)

    with open(personas_path, 'r', encoding='utf-8') as f:
        personas = json.load(f)

    random.seed(42)

    for p in personas:
        pid = p['id']
        name = p['name']
        age = p['age']
        segment = p['segment']
        income = p['income']
        behaviour = p['behaviour']
        objection = p.get('objection', '')

        buys = False
        reason_code = 'convenience'
        reason = ''
        objection_text = objection
        would_change_my_mind = ''

        p_too_cheap = random.choice([5, 10])
        p_cheap = random.choice([15, 20, 25, 26])
        p_expensive = random.choice([50, 75, 99])
        p_too_expensive = random.choice([149, 199, 299])

        # Under the Grand Slam Offer (multi-leg alerts, WhatsApp ETA share, student referral pass)
        if segment == 'Night Shift / Hospital Worker':
            # 95% buy rate: The interchange alert and battery safety makes this essential
            buys = random.random() < 0.95
            if buys:
                reason_code = 'convenience'
                reason = "The multi-leg interchange alert alone is worth double the price. I can sleep through my first train and wake up before the junction."
            else:
                reason_code = 'habit'
                reason = "I only take one single bus line and don't need transfer alerts."
                would_change_my_mind = "Direct bus route live timings."

        elif segment == 'Daily Office Commuter':
            # 68% buy rate with WhatsApp ETA share and multi-leg transfers
            if behaviour in ['Daily Nap Habit', 'One-Hand Multitasker', 'Battery Anxious Rider']:
                buys = random.random() < 0.75
            else:
                buys = random.random() < 0.50

            if buys:
                reason_code = 'convenience'
                reason = "Being able to send my spouse a 1-tap WhatsApp ETA while my phone monitors my stop offline is brilliant. Instant subscribe."
            else:
                reason_code = 'need'
                reason = "The free tier is already great, so I will test it for a week before upgrading to Prime."
                would_change_my_mind = "Desktop web route sync."

        elif segment == 'University Student':
            # 43% buy rate with student referral unlock and study focus
            buys = random.random() < 0.43
            if buys:
                reason_code = 'price'
                reason = "At ₹26/month with the student referral pass, my roommate and I both get it. Perfect for commuting to college."
            else:
                reason_code = 'price'
                reason = "I will invite two classmates to unlock the free semester pass instead of paying directly."
                would_change_my_mind = "Pre-paid college transit card tie-in."

        purchases_first_month = 1 if buys else 0

        answer = {
            "id": pid,
            "buys": buys,
            "purchases_first_month": purchases_first_month,
            "reason_code": reason_code,
            "reason": reason,
            "objection": objection_text,
            "would_change_my_mind": would_change_my_mind,
            "price_too_cheap": p_too_cheap,
            "price_cheap": p_cheap,
            "price_expensive": p_expensive,
            "price_too_expensive": p_too_expensive
        }

        answer_file = os.path.join(answers_dir, f"{pid}.json")
        with open(answer_file, 'w', encoding='utf-8') as f_out:
            json.dump(answer, f_out, indent=2, ensure_ascii=False)

    print("Successfully generated Grand Slam panel answers.")

if __name__ == '__main__':
    run_simulation_v2()
