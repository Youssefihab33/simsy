def initReached(user, show_id, show_kind, season=1, episode=1, time=0):
    if show_id not in user.reached:
        user.reached[show_id] = {}
    if show_kind == 'film':
        if 't' not in user.reached[show_id]:
            user.reached[show_id]['t'] = time
    else:
        if 's' not in user.reached[show_id]:
            user.reached[show_id]['s'] = season
        if 'e' not in user.reached[show_id]:
            user.reached[show_id]['e'] = episode
        if 't' not in user.reached[show_id]:
            user.reached[show_id]['t'] = {str(season):{str(episode):time}}
        if str(season) not in user.reached[show_id]['t']:
            user.reached[show_id]['t'][str(season)] = {str(episode):time}
        if str(episode) not in user.reached[show_id]['t'][str(season)]:
            user.reached[show_id]['t'][str(season)][str(episode)] = time
    return user.reached[show_id]

def updateReached(user, show_id, show_kind, season, episode, time=0):
    show_id = str(show_id)
    user.reached[show_id] = initReached(user, show_id, show_kind, season, episode, time)
    user.reached[show_id]['s'] = season
    user.reached[show_id]['e'] = episode
    season, episode = str(season), str(episode)
    if time:
        if show_kind == 'film':
            user.reached[show_id]['t'] = time
        else:
            user.reached[show_id]['t'][season][episode] = time
    else:
        if show_kind == 'film':
            time = user.reached[show_id]['t']
        else:
            time = user.reached[show_id]['t'][season][episode]
    user.save()
    return season, episode, time

from rest_framework import status
from rest_framework.response import Response
def changeEpisode(user, show_id, new_season, new_episode, changed, message):
    new_season, new_episode, starting_time = updateReached(user, show_id, 'not film', new_season, new_episode)
    return Response({
        'message': message,
        'new_season': new_season,
        'new_episode': new_episode,
        'changed': changed,
        'starting_time': starting_time
    }, status=status.HTTP_200_OK)