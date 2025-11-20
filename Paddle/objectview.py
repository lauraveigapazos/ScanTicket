class objectview(object):
    """convert dict to object with dot notation access"""
    def __init__(self, d):
        self.__dict__.update(d)
    
    def __repr__(self):
        return str(self.__dict__)