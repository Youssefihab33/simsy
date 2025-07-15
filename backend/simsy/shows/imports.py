def saveNewReached(user, show_id, season, episode, time=0):
    if season:
        user.episode_reached[str(show_id)]['s'] = season
    if episode:
        user.episode_reached[str(show_id)]['e'] = episode
    if time:
        user.episode_reached[str(show_id)]['t'] = time
    else:
        try:
            time = user.episode_reached[str(show_id)]['t']
        except KeyError:
            time = 0
    user.save()
    return season, episode, time