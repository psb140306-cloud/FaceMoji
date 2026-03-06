from enum import Enum


class StyleType(str, Enum):
    CARTOON = "cartoon"
    FLAT = "flat"
    ANIME = "anime"
    WATERCOLOR = "watercolor"
    THREE_D = "3d"
    MANGA = "manga"


class ExpressionType(str, Enum):
    SMILE = "smile"
    HEART = "heart"
    CRY = "cry"
    ANGRY = "angry"
    SURPRISE = "surprise"
    SIGH = "sigh"
    WOW = "wow"
    HUH = "huh"
    SLEEPY = "sleepy"
    FIGHTING = "fighting"
    THANKS = "thanks"
    SORRY = "sorry"
    OK = "ok"
    NO = "no"
    THINKING = "thinking"
    CAKE = "cake"
    EXCITED = "excited"
    PANIC = "panic"
    CHEER_UP = "cheer_up"
    DROWSY = "drowsy"
    SHY = "shy"
    HUNGRY = "hungry"
    COLD = "cold"
    HAPPY = "happy"


class GenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
