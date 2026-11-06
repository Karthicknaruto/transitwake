import json
import os
import random

def run_simulation():
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

        # Decision modeling based on persona attributes
        buys = False
        reason_code = 'price'
        reason = ''
        objection_text = objection
        would_change_my_mind = ''

        # Price thresholds (in INR/month)
        p_too_cheap = random.choice([5, 10])
        p_cheap = random.choice([15, 20, 25, 26])
        p_expensive = random.choice([50, 75, 99])
        p_too_expensive = random.choice([149, 199, 299])

        if segment == 'Night Shift / Hospital Worker':
            if behaviour == 'Daily Nap Habit':
                buys = True
                reason_code = 'convenience'
                reason = "After a 12-hour hospital shift, I desperately need to sleep on the train. ₹26 a month to guarantee no ads and loud sirens is an absolute no-brainer."
                would_change_my_mind = "Immediate buy."
            else:
                buys = random.random() < 0.50
                if buys:
                    reason_code = 'convenience'
                    reason = "₹26/month is less than a cup of chai. The earphone callouts keep me from sleeping past my junction stop."
                else:
                    reason_code = 'need'
                    reason = "The free version already gives me the GPS alarm without paying, so I will stick to free first."
                    would_change_my_mind = "If ads interrupt my alarms or audio."

        elif segment == 'Daily Office Commuter':
            if behaviour == 'Battery Anxious Rider':
                if random.random() < 0.45:
                    buys = True
                    reason_code = 'quality'
                    reason = "The 78% battery savings plus offline subway mode is huge for my commute from Whitefield. Happy to pay ₹26 to support and go ad-free."
                else:
                    buys = False
                    reason_code = 'need'
                    reason = "I love the battery saving feature, but since the core alarm is free, I'll test it out first before paying for Prime."
                    would_change_my_mind = "A 3-month bundle with multi-leg transfer alarms."
            elif behaviour == 'Daily Nap Habit':
                buys = True
                reason_code = 'convenience'
                reason = "I commute 80 minutes on the Western line every day and nod off instantly. ₹26 is nothing for guaranteed peace of mind."
            elif behaviour == 'Privacy Conscious User':
                buys = random.random() < 0.40
                if buys:
                    reason_code = 'values'
                    reason = "I respect that there is no account required and GPS stays in RAM. I will pay ₹26 to keep it ad-free and privacy-focused."
                else:
                    buys = False
                    reason_code = 'trust'
                    reason = "I prefer not to enter any payment info unless I have verified zero telemetry over a few weeks."
                    would_change_my_mind = "Third-party privacy audit badge."
            else:
                buys = random.random() < 0.35
                if buys:
                    reason_code = 'convenience'
                    reason = "One tap to dismiss without ads in my face is worth ₹26."
                else:
                    buys = False
                    reason_code = 'habit'
                    reason = "I currently use my phone clock timer; I'll use the free tier before committing to a monthly sub."
                    would_change_my_mind = "Direct integration with metro live delay alerts."

        elif segment == 'University Student':
            if behaviour == 'Price Sensitive / Deal Hunter':
                buys = False
                reason_code = 'price'
                reason = "As a college student, every rupee counts. The free version does everything I need for class commutes."
                would_change_my_mind = "Student discount at ₹15/month or annual pass at ₹199."
            else:
                buys = random.random() < 0.25
                if buys:
                    reason_code = 'price'
                    reason = "₹26/month is cheap enough even for my student budget to get rid of banner ads while listening to study lectures."
                else:
                    buys = False
                    reason_code = 'price'
                    reason = "I don't mind banner ads at the bottom if the alarm itself is 100% free."
                    would_change_my_mind = "Free semester referral unlock."

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

    print("Successfully generated 100 panel answers.")

if __name__ == '__main__':
    run_simulation()
